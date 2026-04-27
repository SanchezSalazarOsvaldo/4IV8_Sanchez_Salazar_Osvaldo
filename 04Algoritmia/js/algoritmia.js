function problema1() {
    var input = document.querySelector("#p1-input").value.trim();
    var output = document.querySelector("#p1-output");

    if (input === "") {
        output.textContent = "Error: debes ingresar al menos una palabra.";
        return;
    }

    // Validación estricta: solo letras y un espacio entre palabras
    if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(input)) {
        output.textContent = "Error: solo se permiten palabras separadas por un solo espacio (sin números ni símbolos).";
        return;
    }

    var palabras = input.split(" ");

    // Limitar cantidad
    if (palabras.length > 10) {
        output.textContent = "Error: máximo 10 palabras permitidas.";
        return;
    }

    palabras.reverse();

    output.textContent = "Resultado:\n" + palabras.join(" ");
}


function problema2() {
    var idsX = ["#p2-x1", "#p2-x2", "#p2-x3", "#p2-x4", "#p2-x5"];
    var idsY = ["#p2-y1", "#p2-y2", "#p2-y3", "#p2-y4", "#p2-y5"];
    var output = document.querySelector("#p2-output");

    var v1 = [];
    var v2 = [];

    for (var i = 0; i < idsX.length; i++) {
        var valorX = document.querySelector(idsX[i]).value.trim();
        var valorY = document.querySelector(idsY[i]).value.trim();

        if (valorX === "" || valorY === "") {
            output.textContent = "Error: todos los campos deben tener un valor.";
            return;
        }

        var numX = Number(valorX);
        var numY = Number(valorY);

        if (isNaN(numX) || isNaN(numY)) {
            output.textContent = "Error: solo se permiten números válidos.";
            return;
        }

        // Validar enteros
        if (!Number.isInteger(numX) || !Number.isInteger(numY)) {
            output.textContent = "Error: solo se permiten números enteros.";
            return;
        }

        // Validar rango
        if (Math.abs(numX) > 1000 || Math.abs(numY) > 1000) {
            output.textContent = "Error: los valores deben estar entre -1000 y 1000.";
            return;
        }

        v1.push(numX);
        v2.push(numY);
    }

    // Ordenamiento para mínimo producto escalar
    v1.sort(function (a, b) { return a - b; });
    v2.sort(function (a, b) { return b - a; });

    var producto = 0;
    var pasos = "";

    for (var j = 0; j < v1.length; j++) {
        var mult = v1[j] * v2[j];
        producto += mult;
        pasos += v1[j] + " × " + v2[j] + " = " + mult + "\n";
    }

    output.textContent =
        "Vectores ordenados:\nX = [" + v1.join(", ") + "]\nY = [" + v2.join(", ") + "]\n\n" +
        "Operaciones:\n" + pasos +
        "\nProducto escalar mínimo: " + producto;
}


function problema3() {
    var input = document.querySelector("#p3-input").value.trim();
    var output = document.querySelector("#p3-output");

    if (input === "") {
        output.textContent = "Error: debes ingresar al menos una palabra.";
        return;
    }

    // No permitir espacios
    if (input.indexOf(" ") !== -1) {
        output.textContent = "Error: no se permiten espacios. Usa solo comas.";
        return;
    }

    // Evitar comas dobles
    if (input.includes(",,")) {
        output.textContent = "Error: no debe haber comas vacías.";
        return;
    }

    var palabras = input.split(",");

    // Limitar cantidad
    if (palabras.length > 10) {
        output.textContent = "Error: máximo 10 palabras permitidas.";
        return;
    }

    var mejorPalabra = "";
    var maxUnicos = -1;
    var detalle = "";

    for (var i = 0; i < palabras.length; i++) {
        var palabra = palabras[i].trim();

        if (palabra === "") {
            output.textContent = "Error: hay palabras vacías.";
            return;
        }

        // Validar solo A-Z mayúsculas
        if (!/^[A-Z]+$/.test(palabra)) {
            output.textContent = "Error: solo se permiten letras mayúsculas (A-Z).";
            return;
        }

        var letrasUnicas = [];

        for (var j = 0; j < palabra.length; j++) {
            if (letrasUnicas.indexOf(palabra[j]) === -1) {
                letrasUnicas.push(palabra[j]);
            }
        }

        var cantidad = letrasUnicas.length;

        detalle += palabra + " = " + cantidad + " (" + letrasUnicas.join(", ") + ")\n";

        if (cantidad > maxUnicos) {
            maxUnicos = cantidad;
            mejorPalabra = palabra;
        }
    }

    output.textContent =
        "Análisis:\n" + detalle +
        "\nLa palabra con más caracteres únicos es: " + mejorPalabra +
        "\nCantidad: " + maxUnicos;
}