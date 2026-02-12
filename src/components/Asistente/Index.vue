<template>
    <div>
        <!-- <div class="header">
            <img src="https://contago.com.mx/img/var_opengraph.png" alt="Logo Contago" class="logo">
            <p>Contago Asistente</p>
        </div> -->

        <!-- <div id="textInput">
            <img src="https://contago.com.mx/img/var_opengraph.png" alt="Logo Contago" class="logo">
            <div style="font-size: 20px;">Contago Asistente</div>
            <q-space />
            <button id="btnOpenSettings" title="Configuración">
                <span class="material-icons">settings</span>
                <span id="chatStatus" class="status-indicator offline" title="Desconectado"></span>
            </button>
        </div> -->

        <button id="btnOpenSettings" class="settings-button" title="Configuración">
            <span class="material-icons">settings</span>
            <span id="chatStatus" class="status-indicator offline" title="Desconectado"></span>
        </button>

        <!-- MODAL CONFICGURACION -->
        <div id="settingsModal" class="modal hidden">
            <div class="modal-content">
                <h2>Configuración</h2>
                <div id="controls">
                    <label>Identidad:
                        <select id="identity">
                            <option value="Dianne">Dianne (Deep Axiom)</option>
                            <option value="Alex">Alex</option>
                            <option value="Sophia">Sophia</option>
                        </select>
                    </label>
                    <label>Voz:
                        <select id="voice">
                            <option value="Leda">Leda (por defecto)</option>
                            <option value="Kore">Constanza</option>
                            <option value="Zephyr">Demo</option>
                        </select>
                    </label>
                    <label>Idioma:
                        <select id="language">
                            <option value="es-US">Español (US)</option>
                            <option value="en-US">Inglés (US)</option>
                            <option value="de-DE">Alemán (DE)</option>
                        </select>
                    </label>
                    <label>Modalidad de respuesta:
                        <select id="modality">
                            <option value="TEXT">Texto</option>
                            <option value="AUDIO">Audio</option>
                        </select>
                    </label>
                    <label class="custom-checkbox">
                        <input type="checkbox" id="enable_search" />
                        <span class="checkmark"></span>
                        Habilitar Búsqueda en Internet
                    </label>

                    <label class="custom-checkbox">
                        <input type="checkbox" id="enable_code" />
                        <span class="checkmark"></span>
                        Habilitar Ejecución de Código
                    </label>
                </div>
                <div class="modal-actions">
                    <button id="btnConnect">Conectar</button>
                    <button id="btnCloseSettings">Cerrar</button>
                </div>
            </div>
        </div>

        <!-- MODAL MEDIA -->
        <div id="modalMedia" class="modal hidden">
            <div class="modal-content class-center">
                <video id="videoPreview" width="100%" height="90%" autoplay muted></video>
                <canvas id="videoCanvas" width="100%" height="90%" style="display:none;"></canvas>

                <button id="btnStopVideo">
                    <span class="material-icons">videocam_off</span>
                </button>
            </div>
        </div>

        <!-- CUADRO DE CHAT -->
        <div id="chat" hidden></div>

        <!-- CAJA DE TEXTO Y BOTONES -->
        <div id="textInput">
            <input type="text" id="inputMessage" placeholder="Escribe tu mensaje..." />
            <button id="btnSendText" disabled title="Enviar">
                <span class="material-icons">send</span>
            </button>

            <button id="btnStartAudio" disabled title="Iniciar Micrófono">
                <span class="material-icons">mic</span>
            </button>

            <button id="btnStopAudio" class="ocultar bg-red" title="Detener Micrófono">
                <span class="material-icons">mic_off</span>
            </button>

            <button id="btnStartVideo" disabled title="Iniciar Cámara">
                <span class="material-icons">videocam</span>
            </button>

            <button id="btnStopVideo" class="ocultar" title="Detener Cámara">
                <span class="material-icons">videocam_off</span>
            </button>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'ContagoAsistente',
        mounted() {
            const wsUrl = "wss://dianne-stream-ai-494247865916.us-central1.run.app/ws/live";
            let ws, inputAudioCtx, outputAudioCtx, audioQueueTime, audioProcessor, micStream, videoInterval, videoStream;
            let currentMessageId = null;
            // ABRE CONEXION AL ESCRIBIR EN CASO DE QUE ESTE CERRADO
            const inputMessage = document.getElementById('inputMessage');
            inputMessage.addEventListener('input', () => {
                openConnectionIfNeeded();
            });

            // FUNCION COMENZAR AUDIO Y ENVIO DE INFORMACION
            async function startAudio() {
                micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                inputAudioCtx = new AudioContext();
                const sampleRateIn = inputAudioCtx.sampleRate;
                const source = inputAudioCtx.createMediaStreamSource(micStream);
                audioProcessor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
                source.connect(audioProcessor);
                audioProcessor.connect(inputAudioCtx.destination);

                audioProcessor.onaudioprocess = (e) => {
                    const input = e.inputBuffer.getChannelData(0);
                    const down = downsampleBuffer(input, sampleRateIn, 16000);
                    const pcm = floatTo16BitPCM(down);
                    const b64 = arrayBufferToBase64(pcm.buffer);
                    ws.send(JSON.stringify({ type: 'audio', data: b64, mime_type: 'audio/pcm;rate=16000', end: false }));
                };

                document.getElementById('btnStopAudio').classList.remove('ocultar');
                document.getElementById('btnStartAudio').classList.add('ocultar');
            }

            // FUNCION PARAR AUDIO 
            function stopAudio() {
                if (audioProcessor) audioProcessor.disconnect();
                if (micStream) micStream.getTracks().forEach(t => t.stop());
                ws.send(JSON.stringify({ type: 'audio', end: true }));
                document.getElementById('btnStopAudio').classList.add('ocultar');
                document.getElementById('btnStartAudio').classList.remove('ocultar');
            }

            // FUNCION COMENZAR GABACION Y ENVIO DE INFORMACION
            const startVideo = async () => {
                videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                document.getElementById('videoPreview').srcObject = videoStream;
                const canvas = document.getElementById('videoCanvas');
                const ctx = canvas.getContext('2d');
                videoInterval = setInterval(() => {
                    ctx.drawImage(document.getElementById('videoPreview'), 0, 0, canvas.width, canvas.height);
                    canvas.toBlob(blob => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const b64 = reader.result.split(',')[1];
                            ws.send(JSON.stringify({ type: 'video', data: b64, mime_type: 'image/png', turn_complete: false }));
                        };
                        reader.readAsDataURL(blob);
                    });
                }, 500);

                document.getElementById('modalMedia').classList.remove('hidden');
                document.getElementById('btnStartVideo').classList.add('ocultar');
                document.getElementById('btnStopVideo').classList.remove('ocultar');
            };

            // FUNCION PARAR VIDEO LLAMADA 
            const stopVideo = () => {
                clearInterval(videoInterval);
                if (videoStream) videoStream.getTracks().forEach(t => t.stop());
                ws.send(JSON.stringify({ type: 'video', turn_complete: true }));

                document.getElementById('btnStartVideo').classList.remove('ocultar');
                document.getElementById('btnStopVideo').classList.add('ocultar');
                document.getElementById('modalMedia').classList.add('hidden');
            };

            function downsampleBuffer(buffer, inputRate, outputRate) {
                if (outputRate === inputRate) return buffer;
                const ratio = inputRate / outputRate;
                const newLength = Math.round(buffer.length / ratio);
                const result = new Float32Array(newLength);
                for (let i = 0; i < newLength; i++) {
                    const start = Math.floor(i * ratio);
                    const end = Math.floor((i + 1) * ratio);
                    let sum = 0;
                    for (let j = start; j < end && j < buffer.length; j++) sum += buffer[j];
                    result[i] = sum / (end - start);
                }
                return result;
            }

            function floatTo16BitPCM(buffer) {
                const out = new Int16Array(buffer.length);
                for (let i = 0; i < buffer.length; i++) {
                    const s = Math.max(-1, Math.min(1, buffer[i]));
                    out[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }
                return out;
            }

            function arrayBufferToBase64(buffer) {
                let binary = '';
                const bytes = new Uint8Array(buffer);
                for (let i = 0; i < bytes.byteLength; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                return window.btoa(binary);
            }

            function playPCM(arrayBuffer) {
                const int16 = new Int16Array(arrayBuffer);
                const float32 = new Float32Array(int16.length);
                for (let i = 0; i < int16.length; i++) {
                    float32[i] = int16[i] / 32768;
                }
                const buf = outputAudioCtx.createBuffer(1, float32.length, 24000);
                buf.getChannelData(0).set(float32);
                const src = outputAudioCtx.createBufferSource();
                src.buffer = buf;
                src.connect(outputAudioCtx.destination);
                const startTime = Math.max(audioQueueTime, outputAudioCtx.currentTime);
                src.start(startTime);
                audioQueueTime = startTime + buf.duration;
            }

            // CREA EL DIALOGO DE MENSAJES
            function appendMessage(text, role) {
                const chat = document.getElementById('chat');

                const msgDiv = document.createElement('div');
                msgDiv.className = 'msg ' + role;

                const avatar = document.createElement('img');
                avatar.className = 'avatar';

                if (role === 'user') {
                    avatar.src = 'https://cdn.quasar.dev/img/boy-avatar.png';
                } else {
                    avatar.src = 'https://contago.com.mx/img/var_opengraph.png';
                }

                const bubble = document.createElement('div');
                bubble.className = 'bubble';

                // 1. Reemplaza **negritas** por <b>negritas</b>
                // 2. Reemplaza \n por <br> para conservar saltos de línea
                const formattedText = text
                    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                    .replace(/\n/g, '<br>');

                bubble.innerHTML = formattedText;

                msgDiv.appendChild(avatar);
                msgDiv.appendChild(bubble);
                chat.appendChild(msgDiv);

                chat.scrollTop = chat.scrollHeight;
            }

            // ENVIA EL ESTADO DEL CHAT (ACTIVO O INACTIVO)
            function setChatStatus(isOnline) {
                const status = document.getElementById('chatStatus');
                if (isOnline) {
                    status.classList.remove('offline');
                    status.classList.add('online');
                    status.title = "Conectado";
                } else {
                    status.classList.remove('online');
                    status.classList.add('offline');
                    status.title = "Desconectado";
                }
            }

            function openConnectionIfNeeded() {
                if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
                    return; // Ya está abierta o en proceso
                }

                outputAudioCtx = new AudioContext();
                outputAudioCtx.resume();
                audioQueueTime = outputAudioCtx.currentTime;

                ws = new WebSocket(wsUrl);

                ws.onopen = () => {
                    const config = {
                        identity: document.getElementById('identity').value,
                        voice: document.getElementById('voice').value,
                        language: document.getElementById('language').value,
                        enable_search: document.getElementById('enable_search').checked,
                        enable_code_execution: document.getElementById('enable_code').checked,
                        response_modality: document.getElementById('modality').value,
                        session_handle: null,
                    };
                    ws.send(JSON.stringify(config));
                    document.getElementById('chat').hidden = false;
                    document.getElementById('textInput').hidden = false;
                    document.getElementById('settingsModal').classList.add('hidden');
                    document.getElementById('btnSendText').disabled = false;
                    document.getElementById('btnStartAudio').disabled = false;
                    document.getElementById('btnStartVideo').disabled = false;

                    setChatStatus(true);
                };

                let mensajeCompleto = '';
                ws.onmessage = (event) => {
                    if (typeof event.data === 'string') {
                        const msg = JSON.parse(event.data);
                        switch (msg.type) {
                            case 'text':
                                console.log(msg)
                                mensajeCompleto += msg.text;
                                break;

                            case 'generation_complete':
                                console.log('--- (Generación completada) ---');
                                appendMessage(mensajeCompleto, 'gemini');
                                mensajeCompleto = ''; // Reiniciamos para el siguiente mensaje
                                break;
                        }
                    } else if (event.data instanceof Blob) {
                        outputAudioCtx.resume();
                        event.data.arrayBuffer().then(playPCM);
                    }
                };

                ws.onclose = () => {
                    console.log('⏹️ Conexión cerrada.');
                    document.getElementById('btnSendText').disabled = true;
                    document.getElementById('btnStartAudio').disabled = true;
                    document.getElementById('btnStartVideo').disabled = true;
                    setChatStatus(false);
                };
            }


            // BOTON ENCENDER AUDIO
            document.getElementById('btnStartAudio').onclick = startAudio;
            // BOTON DE APAGAR AUDI0
            document.getElementById('btnStopAudio').onclick = stopAudio;
            // BOTON DE ENCENDER VIDEO LLAMADA
            document.getElementById('btnStartVideo').onclick = startVideo;
            // BOTON DE APAGAR VIDEO LLAMADA
            document.getElementById('btnStopVideo').onclick = stopVideo;

            // BOTON DE CONGIURACION (ABRIR DIALOGO DE CONFIGURACION)
            document.getElementById('btnOpenSettings').addEventListener('click', () => {
                document.getElementById('settingsModal').classList.remove('hidden');
            });

            // BOTON CERRAR CONFIGURACION (CERRAR DIALOGO)
            document.getElementById('btnCloseSettings').addEventListener('click', () => {
                document.getElementById('settingsModal').classList.add('hidden');
            });

            // BOTON DE ENVIO DE MENSAJE 
            document.getElementById('btnSendText').onclick = () => {
                const input = document.getElementById('inputMessage');
                const text = input.value.trim();
                if (!text || !ws || ws.readyState !== WebSocket.OPEN) return;
                appendMessage(text, 'user');
                ws.send(JSON.stringify({ type: 'text', text, turn_complete: true }));
                input.value = '';
            };

            // BOTON PARA ABRIR CONEXION CON EL SOCKET
            document.getElementById('btnConnect').onclick = () => {
                outputAudioCtx = new AudioContext();
                outputAudioCtx.resume();
                audioQueueTime = outputAudioCtx.currentTime;

                ws = new WebSocket(wsUrl);
                ws.onopen = () => {
                    const config = {
                        identity: document.getElementById('identity').value,
                        voice: document.getElementById('voice').value,
                        language: document.getElementById('language').value,
                        enable_search: document.getElementById('enable_search').checked,
                        enable_code_execution: document.getElementById('enable_code').checked,
                        response_modality: document.getElementById('modality').value,
                        session_handle: null,
                    };
                    ws.send(JSON.stringify(config));
                    document.getElementById('chat').hidden = false;
                    document.getElementById('textInput').hidden = false;
                    document.getElementById('settingsModal').classList.add('hidden');
                    document.getElementById('btnSendText').disabled = false;
                    document.getElementById('btnStartAudio').disabled = false;
                    document.getElementById('btnStartVideo').disabled = false;

                    setChatStatus(true);
                };
                let mensajeCompleto = '';

                ws.onmessage = (event) => {
                    if (typeof event.data === 'string') {
                        const msg = JSON.parse(event.data);
                        console.log(msg)
                        switch (msg.type) {
                            case 'text':
                                console.log(msg)
                                mensajeCompleto += msg.text;
                                break;

                            case 'generation_complete':
                                console.log('--- (Generación completada) ---');
                                appendMessage(mensajeCompleto, 'gemini');
                                mensajeCompleto = ''; // Reiniciamos para el siguiente mensaje
                                break;
                        }
                    } else if (event.data instanceof Blob) {
                        outputAudioCtx.resume();
                        event.data.arrayBuffer().then(playPCM);
                    }
                };

                ws.onclose = () => {
                    console.log('⏹️ Conexión cerrada.')
                    document.getElementById('btnSendText').disabled = true;
                    document.getElementById('btnStartAudio').disabled = true;
                    document.getElementById('btnStartVideo').disabled = true;
                    setChatStatus(false);
                };
            };
        }
    }
</script>

<style>
    @import url("https://fonts.googleapis.com/icon?family=Material+Icons");

    body {
        font-family: Arial, sans-serif;
        margin: 1rem;
    }

    .header {
        display: flex;
        align-items: center;
        gap: 1rem;
        /* espacio entre imagen y título */
        /* margin-bottom: 1rem; */
    }

    .logo {
        width: 30px;
        height: 30px;
        object-fit: contain;
    }




    #chat {
        border: 1px solid #ccc;
        padding: 1rem;
        height: 400px;
        overflow-y: auto;
        background-color: #f5f5f5;
        border-radius: 10px;
        font-family: Arial, sans-serif;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    /* Estructura general del mensaje */
    .msg {
        display: flex;
        align-items: flex-end;
        gap: 0.5rem;
        max-width: 80%;
        animation: fadeIn 0.3s ease;
    }

    /* Burbuja del mensaje */
    .bubble {
        padding: 0.6rem 1rem;
        border-radius: 18px;
        line-height: 1.4;
        font-size: 0.95rem;
        word-wrap: break-word;
        position: relative;
        background-color: #fff;
        color: #202124;
    }

    /* Avatar */
    .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
    }

    /* Usuario (derecha) */
    .msg.user {
        align-self: flex-end;
        flex-direction: row-reverse;
    }

    .msg.user .bubble {
        background-color: #dcf8c6;
        border-bottom-right-radius: 0;
    }

    .msg.user .avatar {
        margin-left: 0.5rem;
    }

    /* Gemini/asistente (izquierda) */
    .msg.gemini {
        align-self: flex-start;
    }

    .msg.gemini .bubble {
        background-color: #fff;
        border-bottom-left-radius: 0;
    }

    /* caja de mensaje y boton */
    #textInput {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border-top: 1px solid #ccc;
        background-color: #fff;
        border-radius: 0 0 10px 10px;
        box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.05);
        font-family: Arial, sans-serif;

        align-items: center;
        /* Alinea los elementos verticalmente */
        gap: 2px;
        /* Espacio entre los elementos */
    }

    #textInput input {
        padding: 0.5rem;
        border-radius: 10px;
        border: 1px solid #ccc;
        width: 60%;
        /* Ancho del campo de texto */
    }

    #textInput button {
        background-color: #1a73e8;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 1.5rem;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: background-color 0.2s ease;
        width: 35px;
        /* Tamaño del botón */
        height: 35px;
        /* Tamaño del botón */
        text-align: center;
        gap: 2px;

    }

    #textInput input {
        flex: 1;
        padding: 0.5rem;
        border-radius: 8px;
        border: 1px solid #ccc;
        font-size: 1rem;
    }



    #textInput button:hover {
        background-color: #155ac1;
    }

    #textInput button:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }

    .material-icons {
        font-size: 24px;
    }

    /* Input de texto */
    #inputMessage {
        flex: 1;
        padding: 0.6rem 1rem;
        border: 1px solid #ccc;
        border-radius: 20px;
        font-size: 1rem;
        outline: none;
        transition: border-color 0.2s ease;
    }

    #inputMessage:focus {
        border-color: #1a73e8;
    }

    /* Botón de enviar */
    #btnSendText {
        padding: 0.5rem 1rem;
        background-color: #1a73e8;
        color: white;
        border: none;
        border-radius: 20px;
        font-size: 0.95rem;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    #btnSendText:hover {
        background-color: #155ac1;
    }


    /* CONFIGURACION */
    /* Botón para abrir la ventana */
    #btnOpenSettings {
        position: fixed;
        top: 1rem;
        right: 1rem;
        background-color: #1a73e8;
        color: white;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        display: flex;
        justify-content: center;
        /* Centra el ícono horizontalmente */
        align-items: center;
        /* Centra el ícono verticalmente */
    }

    #btnOpenSettings:hover {
        background-color: #3765b0;
    }

    #btnOpenSettings i,
    #btnOpenSettings .material-icons {
        font-size: 2rem;
    }

    .status-indicator {
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 15px;
        height: 15px;
        border: 2px solid white;
        border-radius: 50%;
        background-color: #ff3b30;
        /* rojo por defecto */
    }

    .status-indicator.online {
        background-color: #34c759;
        /* verde */
    }

    .status-indicator.offline {
        background-color: #ff3b30;
        /* rojo */
    }

    /* Modal general */
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999;
    }

    /* Ocultar */
    .hidden {
        display: none;
    }

    .ocultar {
        display: none !important;
    }

    .class-center {
        display: flex;
        flex-direction: column;
        align-items: center;
        /* Centra el botón horizontalmente */
        justify-content: center;
        padding: 1rem;
    }

    /* Contenido del modal */
    .modal-content {
        background: #fff;
        padding: 2rem;
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
    }

    .modal-content h2 {
        margin-top: 0;
        font-size: 1.5rem;
        margin-bottom: 1rem;
    }

    /* Controles */
    #controls label {
        display: block;
        margin-bottom: 1rem;
        font-size: 0.95rem;
    }

    #controls select,
    #controls input[type="checkbox"] {
        margin-left: 0.5rem;
    }

    /* Botones en el modal */
    .modal-actions {
        display: flex;
        justify-content: flex-end;
        /* gap: .5rem; */
    }

    .modal-actions button {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
        border-radius: 6px;
        border: none;
        cursor: pointer;
    }

    #btnConnect {
        background-color: #1a73e8;
        color: white;
    }

    #btnCloseSettings {
        background-color: #ccc;
        color: #333;
    }

    #btnStopVideo {
        margin-top: 1rem;
        background-color: #b10000;
        color: white;
        border: none;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .bg-red {
        background-color: #b10000 !important;
    }

    /* select */
    #controls select {
        width: 100%;
        padding: 0.5rem 0.75rem;
        font-size: 0.95rem;
        border: 1px solid #ccc;
        border-radius: 8px;
        background-color: #f9f9f9;
        color: #333;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
        appearance: none;
        background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7'%3E%3Cpath fill='%23666' d='M0 0l5 7 5-7z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.75rem center;
        background-size: 10px 7px;
    }

    #controls select:focus {
        border-color: #1a73e8;
        box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
        background-color: #fff;
    }

    /* estilos checkbox */
    /* Estilo para los labels con checkbox */
    .custom-checkbox {
        display: flex;
        align-items: center;
        position: relative;
        padding-left: 30px;
        margin-bottom: 1rem;
        cursor: pointer;
        font-size: 0.95rem;
        user-select: none;
    }

    /* Ocultar el checkbox nativo */
    .custom-checkbox input[type="checkbox"] {
        position: absolute;
        opacity: 0;
        cursor: pointer;
    }

    /* Estilo del check */
    .custom-checkbox .checkmark {
        position: absolute;
        left: 0;
        top: 0;
        height: 20px;
        width: 20px;
        background-color: #eee;
        border-radius: 4px;
        border: 1px solid #ccc;
        transition: all 0.2s ease;
    }

    /* Al pasar el mouse */
    .custom-checkbox:hover .checkmark {
        background-color: #f0f0f0;
    }

    /* Cuando está marcado */
    .custom-checkbox input:checked~.checkmark {
        background-color: #1a73e8;
        border-color: #1a73e8;
    }

    /* Icono de palomita */
    .custom-checkbox .checkmark::after {
        content: "";
        position: absolute;
        display: none;
    }

    .custom-checkbox input:checked~.checkmark::after {
        display: block;
    }

    /* Palomita (✓) */
    .custom-checkbox .checkmark::after {
        left: 6px;
        top: 2px;
        width: 6px;
        height: 12px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
    }

    /* Animación */
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(5px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>