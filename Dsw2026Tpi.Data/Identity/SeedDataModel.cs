using System;
using System.Collections.Generic;
using System.Text;

namespace Dsw2026Tpi.Data.Identity
{
    public class SeedData
    {
        public List<SeedSpecialty> Specialties { get; set; } = [];
        public List<SeedDoctor> Doctors { get; set; } = [];
        public List<SeedPatient> Patients { get; set; } = [];
    }

    public class SeedSpecialty
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class SeedDoctor
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string LicenseNumber { get; set; } = string.Empty;
        public Guid SpecialtyId { get; set; }
    }

    public class SeedPatient
    {
        public string Dni { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
    }
}
