using System.Text.Json;
using Dsw2026Tpi.CrossCutting.Identity;
using Dsw2026Tpi.Data;
using Dsw2026Tpi.Data.Identity;
using Dsw2026Tpi.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Dsw2026Tpi.Data;

public static class DataSeeder
{
    public static async Task SeedFromJsonAsync(IServiceProvider services, string jsonFilePath)
    {
        if (!File.Exists(jsonFilePath))
        {
            Console.WriteLine($"[Seeder] Archivo no encontrado: {jsonFilePath}");
            return;
        }

        var json = await File.ReadAllTextAsync(jsonFilePath);
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var data = JsonSerializer.Deserialize<SeedData>(json, options);

        if (data is null) return;

        var dbContext = services.GetRequiredService<Dsw2026TpiDbContext>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<ApplicationRole>>();

        // 1. SEED DE ESPECIALIDADES
        foreach (var s in data.Specialties)
        {
            var exists = await dbContext.Specialities.AnyAsync(x => x.Id == s.Id || x.Name == s.Name);
            if (!exists)
            {
                var specialty = new Specialty(s.Name, s.Description, s.Id);
                await dbContext.Specialities.AddAsync(specialty);
            }
        }
        await dbContext.SaveChangesAsync();

        // 2. SEED DE DOCTORES
        foreach (var d in data.Doctors)
        {
            var exists = await dbContext.Doctors.AnyAsync(x => x.Id == d.Id || x.LicenseNumber == d.LicenseNumber);
            if (!exists)
            {
                var specialty = await dbContext.Specialities.FindAsync(d.SpecialtyId);
                if (specialty != null)
                {
                    var doctor = new Doctor(d.Name, d.LicenseNumber, specialty, d.Id);
                    await dbContext.Doctors.AddAsync(doctor);
                }
            }
        }
        await dbContext.SaveChangesAsync();

        // 3. SEED DE PACIENTES (Identity + Patient Entity)
        // Aseguramos que el rol 'Patient' exista en Identity
        if (!await roleManager.RoleExistsAsync(Roles.Patient))
        {
            await roleManager.CreateAsync(new ApplicationRole { Name = Roles.Patient });
        }

        foreach (var p in data.Patients)
        {
            // Verificamos si el paciente ya existe en el dominio por DNI
            var patientExists = await dbContext.Patients.AnyAsync(x => x.Dni == p.Dni);
            if (patientExists) continue;

            // Buscamos o creamos el usuario en Identity
            var user = await userManager.FindByEmailAsync(p.Email);
            if (user is null)
            {
                user = new ApplicationUser
                {
                    Id = Guid.NewGuid(),
                    UserName = p.Email,
                    Email = p.Email,
                    EmailConfirmed = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Deleted = false
                };

                // Si no requiere password para login de paciente, se le asigna un dummy que cumpla las políticas de Identity
                var createResult = await userManager.CreateAsync(user, "Paciente123!");
                if (!createResult.Succeeded)
                {
                    var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
                    throw new InvalidOperationException($"Error creando usuario Identity del paciente: {errors}");
                }
            }

            // Aseguramos que tenga el rol Patient
            if (!await userManager.IsInRoleAsync(user, Roles.Patient))
            {
                await userManager.AddToRoleAsync(user, Roles.Patient);
            }

            // Creamos el Patient en la base de datos de dominio
            var patient = new Patient(user.Id, p.Dni)
            {
                FullName = p.FullName,
                Phone = p.Phone
            };

            await dbContext.Patients.AddAsync(patient);
        }

        await dbContext.SaveChangesAsync();
        Console.WriteLine("[Seeder] Datos de prueba inicializados correctamente.");
    }
}
