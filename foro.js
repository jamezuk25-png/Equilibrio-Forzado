import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB0LfP7d-UaR2lXgscZHFy97BU2b2SByA8",
    authDomain: "equilibrio-forzado-foro.firebaseapp.com",
    projectId: "equilibrio-forzado-foro",
    storageBucket: "equilibrio-forzado-foro.firebasestorage.app",
    messagingSenderId: "150985663508",
    appId: "1:150985663508:web:b57a9a5c0bd4237d2cf301",
    measurementId: "G-30WRGRF5ZR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const formulario = document.getElementById("form-propuesta");
formulario.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombreInput = document.getElementById("nombre").value;
    const ideaInput = document.getElementById("idea").value;

    try {
        await addDoc(collection(db, "mensajes"), {
            nombre: nombreInput,
            idea: ideaInput,
            fecha: new Date()
        });
        alert("¡Propuesta enviada!");
        formulario.reset();
    } catch (e) {
        console.error("Error al enviar: ", e);
    }
});

const contenedorMensajes = document.getElementById("contenedor-mensajes");
const q = query(collection(db, "mensajes"), orderBy("fecha", "desc"));

onSnapshot(q, (snapshot) => {
    contenedorMensajes.innerHTML = ""; 
    
    snapshot.forEach((doc) => {
        const data = doc.data();
        const divMensaje = document.createElement("div");
        divMensaje.classList.add("mensaje-item");
        
        divMensaje.innerHTML = `
            <h4>${data.nombre}</h4>
            <p>${data.idea}</p>
            <div class="respuesta-box">
                <input type="text" id="input-${doc.id}" placeholder="Escribe una respuesta...">
                <button class="btn-enviar-res" data-id="${doc.id}">Enviar</button>
            </div>
            <div class="lista-comentarios" id="coments-${doc.id}"></div>
        `;
        contenedorMensajes.appendChild(divMensaje);

        cargarComentarios(doc.id, document.getElementById(`coments-${doc.id}`));
    });
});

function cargarComentarios(mensajeId, contenedor) {
    const qComents = query(collection(db, "mensajes", mensajeId, "comentarios"), orderBy("fecha", "asc"));
    onSnapshot(qComents, (snapshot) => {
        contenedor.innerHTML = ""; 
        snapshot.forEach((doc) => {
            const data = doc.data();
            const p = document.createElement("p");
            p.classList.add("comentario-item");
            p.textContent = `> ${data.texto}`;
            contenedor.appendChild(p);
        });
    });
}

// Evento para enviar respuesta
document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn-enviar-res")) {
        const id = e.target.getAttribute("data-id");
        const input = document.getElementById(`input-${id}`);
        
        if (input && input.value.trim() !== "") {
            await addDoc(collection(db, "mensajes", id, "comentarios"), {
                texto: input.value,
                fecha: new Date()
            });
            input.value = ""; 
        }
    }
});