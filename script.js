document.addEventListener('DOMContentLoaded', () => {
    // ... (código inicial igual hasta la definición de deniedImageName)

    const deniedImageName = "denied.png";

    // Modifica las funciones que manejan rutas de imágenes:

    function _lockMaterial(matId) {
        const mat = materialElements[matId];
        mat.box.classList.add('locked');
        mat.box.style.backgroundColor = colors["locked_bg"];
        mat.box.style.color = 'gray';
        
        // Ruta relativa modificada para GitHub Pages
        const deniedPath = `./images/${encodeURIComponent(deniedImageName)}`;
        mat.image.src = deniedPath;
        mat.image.alt = mat.name + " (BLOQUEADO)";
        
        // ... (resto de la función igual)
    }

    function updateMaterialImageAndText(matId) {
        const mat = materialElements[matId];
        if (mat.box.classList.contains('locked')) return;
        
        const materialNameClean = mat.name.replace(" (LOCKED)", "").trim();
        const imageNameWithExt = materialNameClean + ".png";
        
        // Ruta relativa modificada para GitHub Pages
        const imagePath = `./images/${encodeURIComponent(imageNameWithExt)}`;
        
        mat.image.src = imagePath;
        mat.image.alt = materialNameClean;
        
        mat.image.onload = () => {
            mat.image.style.display = 'block';
            mat.text.style.display = 'none';
        };
        
        mat.image.onerror = () => {
            mat.image.style.display = 'none';
            mat.text.style.display = 'block';
            mat.text.textContent = materialNameClean;
            console.warn("Error al cargar:", imagePath);
        };
        
        if(mat.image.complete && mat.image.naturalHeight !== 0) {
            mat.image.style.display = 'block';
            mat.text.style.display = 'none';
        }
        else if (mat.image.complete) {
            mat.image.style.display = 'none';
            mat.text.style.display = 'block';
            mat.text.textContent = materialNameClean;
        }
    }

    function updateBaseDisplay(equipo, clase, nivel, updateColorVarAndHideMenu) {
        // ... (código previo igual)
        
        if (imageName) {
            // Ruta relativa modificada para GitHub Pages
            baseImg.src = `./images/${encodeURIComponent(imageName)}`;
            baseImg.alt = baseTextContent || equipo;
            
            // ... (resto de la función igual)
        }
    }

    // ... (resto del código permanece igual)
    init();
});
