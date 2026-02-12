const resizeImagePixels = async (file, maxWidth, maxHeight) => {
    // Crear un elemento de imagen
    const img = document.createElement('img');

    // Convertir el archivo de imagen a un objeto Blob
    const blob = file instanceof Blob ? file : file.slice(0, file.size, file.type);

    // Crear un objeto URL para el Blob
    const url = URL.createObjectURL(blob);

    // Cargar la imagen en el elemento img
    await new Promise((resolve) => {
        img.onload = resolve;
        img.src = url;
    });

    // Calcular las dimensiones de la imagen redimensionada
    let width = img.width;
    let height = img.height;

    if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
    }

    // Crear un lienzo para el nuevo tamaño
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    // Dibujar la imagen redimensionada en el lienzo
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    // Obtener la imagen redimensionada en formato Base64
    const resizedDataUrl = canvas.toDataURL();

    // Liberar el objeto URL
    URL.revokeObjectURL(url);

    return resizedDataUrl;
};

export { resizeImagePixels };