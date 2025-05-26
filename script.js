// script.js
document.addEventListener('DOMContentLoaded', () => {
    const equipoMenu = document.getElementById('equipo_menu');
    const claseMenu = document.getElementById('clase_menu');
    const nivelMenu = document.getElementById('nivel_menu');
    const colorMenu = document.getElementById('color_menu');

    const materialElements = {
        material1: { box: document.getElementById('material1_box'), image: document.getElementById('material1_image'), text: document.getElementById('material1_text'), colorMenu: document.getElementById('material1_color_menu'), name: "MATERIAL-COLOR 1" },
        material2: { box: document.getElementById('material2_box'), image: document.getElementById('material2_image'), text: document.getElementById('material2_text'), colorMenu: document.getElementById('material2_color_menu'), name: "MATERIAL-COLOR 2" },
        material3: { box: document.getElementById('material3_box'), image: document.getElementById('material3_image'), text: document.getElementById('material3_text'), colorMenu: document.getElementById('material3_color_menu'), name: "MATERIAL-COLOR 3" },
        material4: { box: document.getElementById('material4_box'), image: document.getElementById('material4_image'), text: document.getElementById('material4_text'), colorMenu: document.getElementById('material4_color_menu'), name: "MATERIAL-COLOR 4" }
    };
    const baseElement = { box: document.getElementById('base_box'), image: document.getElementById('base_image'), text: document.getElementById('base_text'), colorMenu: document.getElementById('base_color_menu') };

    const colors = { "Blanco": "#fefefe", "Verde": "#b6e7b0", "Azul": "#a0c4ff", "Morado": "#caa8f5", "Dorado": "#f9dd65", "default_bg": "#e5e5e5", "locked_bg": "#ccc", "text_color": "#222" };
    const colorOptionsAllList = ["Blanco", "Verde", "Azul", "Morado", "Dorado"];
    const equipoOptions = ["Espada", "Pecho", "Botas", "Casco", "Guantes", "Cinturón"];
    const claseOptions = ["Normal", "Campeón", "Planewalker", "Lord", "Noble Lord"];
    const nivelOptionsAll = ["Nvl 1", "Nvl 2", "Nvl 3", "Nvl 4", "Nvl 5"];
    const baseColorOptions = ["Blanco", "Morado", "Dorado"];
    const deniedImageName = "denied.png";

    let materialColorMenusVisible = { material1: false, material2: false, material3: false, material4: false };
    let baseColorMenuVisible = false;

    function populateSelect(selectElement, options, defaultSelectedValue) {
        selectElement.innerHTML = '';
        options.forEach(optionValue => selectElement.add(new Option(optionValue, optionValue)));
        if (defaultSelectedValue && options.includes(defaultSelectedValue)) selectElement.value = defaultSelectedValue;
        else if (options.length > 0) selectElement.value = options[0];
    }

    function init() {
        populateSelect(equipoMenu, equipoOptions, "Espada");
        populateSelect(claseMenu, claseOptions, "Normal");
        populateSelect(nivelMenu, nivelOptionsAll, "Nvl 1");
        populateSelect(colorMenu, colorOptionsAllList, "Blanco");
        Object.values(materialElements).forEach(mat => populateSelect(mat.colorMenu, colorOptionsAllList, "Blanco"));
        populateSelect(baseElement.colorMenu, baseColorOptions, "Blanco");
        addEventListeners();
        updateAll();
    }

    function addEventListeners() {
        [equipoMenu, claseMenu, nivelMenu, colorMenu].forEach(menu => menu.addEventListener('change', onSelectionChange));
        for (const matId in materialElements) {
            materialElements[matId].box.addEventListener('click', () => toggleColorMenu(matId));
            materialElements[matId].colorMenu.addEventListener('change', () => onMaterialColorChange(matId));
            materialElements[matId].colorMenu.addEventListener('blur', () => setTimeout(() => { if (materialColorMenusVisible[matId] && document.activeElement !== materialElements[matId].colorMenu) { materialElements[matId].colorMenu.style.display = 'none'; materialColorMenusVisible[matId] = false; }}, 100));
        }
        baseElement.box.addEventListener('click', toggleBaseColorMenu);
        baseElement.colorMenu.addEventListener('change', onBaseColorChange);
        baseElement.colorMenu.addEventListener('blur', () => setTimeout(() => { if (baseColorMenuVisible && document.activeElement !== baseElement.colorMenu) { baseElement.colorMenu.style.display = 'none'; baseColorMenuVisible = false; }}, 100));
    }

    function onSelectionChange() { updateAll(); }

    function hideAllColorMenus() {
        for (const matId in materialElements) if (materialColorMenusVisible[matId]) { materialElements[matId].colorMenu.style.display = 'none'; materialColorMenusVisible[matId] = false; }
        if (baseColorMenuVisible) { baseElement.colorMenu.style.display = 'none'; baseColorMenuVisible = false; }
    }

    function toggleColorMenu(matId) {
        const menu = materialElements[matId].colorMenu;
        if (materialElements[matId].box.classList.contains('locked') || menu.disabled) return;
        const currentlyVisible = materialColorMenusVisible[matId];
        hideAllColorMenus();
        if (!currentlyVisible) { menu.style.display = 'block'; materialColorMenusVisible[matId] = true; menu.focus(); }
    }

    function toggleBaseColorMenu() {
        if (baseElement.box.classList.contains('locked') || baseElement.colorMenu.disabled) return;
        const currentlyVisible = baseColorMenuVisible;
        hideAllColorMenus();
        if (!currentlyVisible) { baseElement.colorMenu.style.display = 'block'; baseColorMenuVisible = true; baseElement.colorMenu.focus(); }
    }

    function onMaterialColorChange(matId) {
        const mat = materialElements[matId];
        if (!mat.box.classList.contains('locked')) {
            const selectedColorName = mat.colorMenu.value;
            mat.box.style.backgroundColor = colors[selectedColorName] || colors["default_bg"];
            mat.box.style.color = (selectedColorName === "Dorado" ? '#333' : colors["text_color"]);
            updateMaterialImageAndText(matId);
        }
    }

    function onBaseColorChange() {
        if (!baseElement.box.classList.contains('locked')) {
            const selectedColorName = baseElement.colorMenu.value;
            baseElement.box.style.backgroundColor = colors[selectedColorName] || colors["default_bg"];
            baseElement.box.style.color = (selectedColorName === "Dorado" ? '#333' : colors["text_color"]);
            updateBaseDisplay(equipoMenu.value, claseMenu.value, nivelMenu.value, false);
        }
    }

    function updateAll() {
        const equipo = equipoMenu.value;
        const clase = claseMenu.value;
        updateMaterialsNames(equipo, clase);
        controlLevelByClass(clase);
        const nivelActual = nivelMenu.value;
        restrictColorOptions(clase, nivelActual);
        updateBaseDisplay(equipo, clase, nivelActual, true);
        updateMaterialStatesAndVisuals(nivelActual);
        restrictMaterialColorOptions(clase);
        applySelectorColors();
        updateAllMaterialBoxBackgroundsAndImages();
    }

    function updateBaseDisplay(equipo, clase, nivel, updateColorVarAndHideMenu) {
        let baseTextContent = "", baseStateDisabled = false, imageName = "";
        const baseBox = baseElement.box, baseImg = baseElement.image, baseTxtSpan = baseElement.text;
        baseImg.style.display = 'none'; baseTxtSpan.style.display = 'block';

        if (clase === "Normal") {
            if (nivel === "Nvl 1" && colorMenu.value === "Blanco") { baseStateDisabled = true; imageName = deniedImageName; }
            else { baseTextContent = `Equipo de\nnivel ${nivel.replace("Nvl ", "")}\no menor`; }
        } else if (clase === "Campeón") { baseTextContent = `${equipo}\nNvl 4`; imageName = `${equipo}.png`; }
        else if (clase === "Planewalker") { baseTextContent = `${equipo}\nNvl 5`; imageName = `${equipo}.png`; }
        else if (clase === "Lord") { baseTextContent = `${equipo}\nNvl 5`; imageName = `${equipo}.png`; }
        else if (clase === "Noble Lord") { baseTextContent = `${equipo} Lord\nNvl 5`; imageName = `${equipo}.png`; }

        baseTxtSpan.innerText = baseTextContent;
        if (imageName) {
            baseImg.src = `images/${imageName}`;  // Ruta modificada
            baseImg.alt = baseTextContent || equipo;
            baseImg.onload = () => { baseImg.style.display = 'block'; baseTxtSpan.style.display = 'none'; };
            baseImg.onerror = () => { 
                console.error("Error al cargar imagen base:", baseImg.src);
                baseImg.style.display = 'none'; 
                baseTxtSpan.style.display = 'block';
            };
            
            if(baseImg.complete && baseImg.naturalHeight !== 0) {
                baseImg.style.display = 'block'; 
                baseTxtSpan.style.display = 'none';
            }
            else if (baseImg.complete) {
                baseImg.style.display = 'none'; 
                baseTxtSpan.style.display = 'block';
            }
        } else { 
            baseImg.style.display = 'none'; 
            baseTxtSpan.style.display = 'block'; 
        }

        baseElement.colorMenu.disabled = baseStateDisabled;
        if (baseStateDisabled) {
            baseBox.classList.add('locked'); 
            baseBox.style.backgroundColor = colors["locked_bg"]; 
            baseBox.style.color = 'gray';
            if (updateColorVarAndHideMenu) baseElement.colorMenu.value = "Blanco";
            if (baseColorMenuVisible && updateColorVarAndHideMenu) { 
                baseElement.colorMenu.style.display = 'none'; 
                baseColorMenuVisible = false; 
            }
        } else {
            baseBox.classList.remove('locked'); 
            const currentBaseColor = baseElement.colorMenu.value;
            baseBox.style.backgroundColor = colors[currentBaseColor] || colors["default_bg"];
            baseBox.style.color = (currentBaseColor === "Dorado" ? '#333' : colors["text_color"]);
        }
    }

    function updateMaterialsNames(equipo, clase) {
        const map = {
            "Normal": { 
                "Espada": {"m1":"Maxilar", "m2":"Garra", "m3":"Hoja", "m4":"Césped"}, 
                "Pecho": {"m1":"Maxilar", "m2":"Garra", "m3":"Hoja", "m4":"Césped"}, 
                "Botas": {"m1":"Nudo", "m2":"Acero", "m3":"Pluma", "m4":"Extraer"}, 
                "Casco": {"m1":"Nudo", "m2":"Acero", "m3":"Pluma", "m4":"Extraer"}, 
                "Guantes": {"m1":"Diente de sierra", "m2":"Pelaje", "m3":"Cristal", "m4":"Stardust"}, 
                "Cinturón": {"m1":"Diente de sierra", "m2":"Pelaje", "m3":"Cristal", "m4":"Stardust"} 
            },
            "Campeón": { 
                "Espada": {"m1":"Quijada ácida", "m2":"Oro talon", "m3":"Hoja de jade", "m4":"Ámbar hierba"}, 
                "Pecho": {"m1":"Quijada ácida", "m2":"Oro talon", "m3":"Hoja de jade", "m4":"Ámbar hierba"}, 
                "Botas": {"m1":"Carbonizado gnarl", "m2":"Acero reforzado", "m3":"Pluma stick", "m4":"Extracto destilado"}, 
                "Casco": {"m1":"Carbonizado gnarl", "m2":"Acero reforzado", "m3":"Pluma stick", "m4":"Extracto destilado"}, 
                "Guantes": {"m1":"Razor diente de sierra", "m2":"Piel de terciopelo", "m3":"Crystal mystic", "m4":"Tempest stardust"}, 
                "Cinturón": {"m1":"Razor diente de sierra", "m2":"Piel de terciopelo", "m3":"Crystal mystic", "m4":"Tempest stardust"} 
            },
            "Lord": { "all": {"m1":"Voluntad del emperador", "m2":"Guardia del emperador", "m3":"Alma del emperador", "m4":"Aliento del emperador"} }
        };
        map["Planewalker"] = map["Campeón"]; 
        map["Noble Lord"] = map["Lord"];
        
        let namesToSet = (clase === "Lord" || clase === "Noble Lord") ? map[clase].all : (map[clase] && map[clase][equipo] ? map[clase][equipo] : {});
        materialElements.material1.name = namesToSet.m1 || "Material 1"; 
        materialElements.material2.name = namesToSet.m2 || "Material 2";
        materialElements.material3.name = namesToSet.m3 || "Material 3"; 
        materialElements.material4.name = namesToSet.m4 || "Material 4";
    }

    function updateMaterialStatesAndVisuals(nivel) {
        const nivelNum = parseInt(nivel.replace("Nvl ", ""));
        for (const matId in materialElements) {
            const mat = materialElements[matId];
            mat.box.classList.remove('locked'); 
            mat.colorMenu.disabled = false; 
            mat.colorMenu.value = "Blanco";
            mat.box.style.backgroundColor = colors["Blanco"]; 
            mat.box.style.color = colors["text_color"];
            updateMaterialImageAndText(matId);
            if (materialColorMenusVisible[matId]) { 
                mat.colorMenu.style.display = 'none'; 
                materialColorMenusVisible[matId] = false; 
            }
        }
        if (nivelNum === 1) { _lockMaterial("material3"); _lockMaterial("material4"); }
        else if (nivelNum === 2) { _lockMaterial("material4"); }
    }

    function _lockMaterial(matId) {
        const mat = materialElements[matId];
        mat.box.classList.add('locked'); 
        mat.box.style.backgroundColor = colors["locked_bg"]; 
        mat.box.style.color = 'gray';
        const deniedPath = `images/${deniedImageName}`;  // Ruta modificada
        mat.image.src = deniedPath; 
        mat.image.alt = mat.name + " (BLOQUEADO)";
        mat.image.onload = () => { 
            mat.image.style.display = 'block'; 
            mat.text.style.display = 'none'; 
        };
        mat.image.onerror = () => { 
            console.error("Error al cargar imagen bloqueada:", deniedPath);
            mat.image.style.display = 'none'; 
            mat.text.style.display = 'block'; 
            mat.text.textContent = mat.name + " (BLOQUEADO)";
        };
        
        if(mat.image.complete && mat.image.naturalHeight !== 0) {
            mat.image.style.display = 'block'; 
            mat.text.style.display = 'none';
        }
        else if (mat.image.complete) {
            mat.image.style.display = 'none'; 
            mat.text.style.display = 'block'; 
            mat.text.textContent = mat.name + " (BLOQUEADO)";
        }

        mat.colorMenu.disabled = true; 
        mat.colorMenu.value = "Blanco";
        if (materialColorMenusVisible[matId]) { 
            mat.colorMenu.style.display = 'none'; 
            materialColorMenusVisible[matId] = false; 
        }
    }

    function updateMaterialImageAndText(matId) {
        const mat = materialElements[matId];
        if (mat.box.classList.contains('locked')) return;
        
        const materialNameClean = mat.name.replace(" (LOCKED)", "").trim();
        const imageNameWithExt = materialNameClean + ".png";
        const imagePath = `images/${imageNameWithExt}`;  // Ruta modificada

        mat.image.src = imagePath; 
        mat.image.alt = materialNameClean;
        mat.image.onload = () => { 
            mat.image.style.display = 'block'; 
            mat.text.style.display = 'none'; 
        };
        mat.image.onerror = () => { 
            console.error("Error al cargar imagen material:", imagePath);
            mat.image.style.display = 'none'; 
            mat.text.style.display = 'block'; 
            mat.text.textContent = materialNameClean;
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

    function updateAllMaterialBoxBackgroundsAndImages() {
        for (const matId in materialElements) {
            const mat = materialElements[matId];
            if (!mat.box.classList.contains('locked')) {
                const selectedColorName = mat.colorMenu.value;
                mat.box.style.backgroundColor = colors[selectedColorName] || colors["default_bg"];
                mat.box.style.color = (selectedColorName === "Dorado" ? '#333' : colors["text_color"]);
                updateMaterialImageAndText(matId);
            }
        }
    }

    function controlLevelByClass(clase) {
        let currentLevelValue = nivelMenu.value, newNivelOptions = nivelOptionsAll, newNivelStateDisabled = false, newNivelValue = currentLevelValue;
        if (clase === "Campeón") { 
            newNivelOptions = ["Nvl 4"]; 
            newNivelValue = "Nvl 4"; 
            newNivelStateDisabled = true; 
        }
        else if (["Planewalker", "Lord", "Noble Lord"].includes(clase)) { 
            newNivelOptions = ["Nvl 5"]; 
            newNivelValue = "Nvl 5"; 
            newNivelStateDisabled = true; 
        }
        populateSelect(nivelMenu, newNivelOptions, newNivelValue); 
        nivelMenu.disabled = newNivelStateDisabled;
        if (!newNivelOptions.includes(nivelMenu.value) && newNivelOptions.length > 0) nivelMenu.value = newNivelOptions[0];
    }

    function restrictColorOptions(clase, nivel) {
        let allowedColors = (clase === "Normal") ? colorOptionsAllList : ["Azul", "Morado", "Dorado"];
        const currentColor = colorMenu.value; 
        populateSelect(colorMenu, allowedColors, currentColor);
        if (!allowedColors.includes(colorMenu.value)) colorMenu.value = allowedColors.length > 0 ? allowedColors[0] : "Blanco";
    }

    function restrictMaterialColorOptions(clase) {
        let allowedMaterialColors = (["Lord", "Noble Lord"].includes(clase)) ? ["Azul", "Morado", "Dorado"] : colorOptionsAllList;
        for (const matId in materialElements) {
            const mat = materialElements[matId], currentColor = mat.colorMenu.value;
            populateSelect(mat.colorMenu, allowedMaterialColors, currentColor);
            if (!allowedMaterialColors.includes(mat.colorMenu.value)) mat.colorMenu.value = allowedMaterialColors.length > 0 ? allowedMaterialColors[0] : "Blanco";
        }
    }

    function applySelectorColors() {
        const selectedColorName = colorMenu.value, menusToStyle = [equipoMenu, claseMenu, nivelMenu, colorMenu];
        const prefix = "form-select-", possibleClasses = colorOptionsAllList.map(c => prefix + c.toLowerCase());
        menusToStyle.forEach(menu => {
            possibleClasses.forEach(cls => menu.classList.remove(cls));
            const newClass = prefix + selectedColorName.toLowerCase();
            if (colors[selectedColorName]) menu.classList.add(newClass);
            else menu.classList.add(prefix + "blanco");
        });
    }

    init();
});
