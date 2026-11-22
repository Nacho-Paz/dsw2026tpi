// Convierte un error de axios en un mensaje para mostrar al usuario.
// El back responde errores con { errorCode, message, details }.

export const getErrorMessage = (err, fallback) => {
  // El back respondió 429 (rate limiting)
  if (err.response?.status === 429) {
    return 'Hiciste demasiados pedidos seguidos. Esperá unos segundos e intentá de nuevo.';
  }

  // No hubo respuesta: back apagado, URL o puerto equivocado, CORS
  if (!err.response) {
    return 'No se pudo conectar con el servidor. Verificá que el back esté encendido.';
  }

  return err.response.data?.message ?? fallback;
};