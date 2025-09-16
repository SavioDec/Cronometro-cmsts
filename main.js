var seconds = 0;
var minutes = 0;
var myVar;
var pausado = 0;

// áudio
var audioCtx = null;

// cria/retoma o AudioContext na primeira interação do usuário
function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    // tenta retomar (muitos navegadores exigem interação do usuário)
    audioCtx.resume().catch(function(e){
      console.log("Audio resume failed:", e);
    });
  }
}

// função beep reutilizável com envelope para evitar estalos
function beep(duration = 200, frequency = 1000, volume = 0.2) {
  if (!audioCtx) return; // não inicializado (chame ensureAudio() por uma interação)
  try {
    const now = audioCtx.currentTime;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);

    // envelope rápido: ataque 10ms, decaimento até o fim
    gainNode.gain.setValueAtTime(0.0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(0.0, now + duration / 1000);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(now);
    oscillator.stop(now + duration / 1000 + 0.02);
  } catch (err) {
    console.error("Erro ao tocar beep:", err);
  }
}

function setSecondsFunction(sec){
  // garante que o áudio foi autorizado por uma interação do usuário
  ensureAudio();

  if ((sec < 0) && (minutes > 0)){
      seconds += minutes * 60;
      minutes = 0;
      seconds += sec;
  }else{
    seconds += sec;  
  }  
  console.log("seconds (total):", seconds);
  clearInterval(myVar);
  myVar = setInterval(myTimer, 1000);
  // atualiza UI imediatamente
  myTimer();
}

function myTimer() {
  if (seconds >= 60){
    minutes += Math.floor(seconds/60);
    seconds = Math.round((seconds/60 - Math.floor(seconds/60))*60);    
  }

  if (minutes < 10){
    document.getElementById("min").innerHTML = "0" + minutes + ": ";
  }else{
    document.getElementById("min").innerHTML = minutes + ": ";
  }

  if (seconds < 10){
    document.getElementById("seg").innerHTML = " 0" + seconds;
  }else{
    document.getElementById("seg").innerHTML = seconds;
  }

  if (minutes > 0 && seconds == 0){
    minutes--;
    seconds = 60;
  }
  if ((minutes == 0 && seconds <= 0) || seconds < 0){
    stopFunction();
    return;
  }

  // menos de 10 segundos → piscar + beep (só se NÃO estiver pausado)
  if (minutes === 0 && seconds < 10 && seconds >= 0 && pausado === 0){
    document.body.classList.add("alerta");
    // toca o beep — já garantimos ensureAudio() na interação inicial
    beep(220, 1000, 0.22);
  } else {
    document.body.classList.remove("alerta");
  }

  if (pausado == 0){
      seconds -= 1;
  }    
}

function stopFunction() {
  clearInterval(myVar);  
  document.location.reload(true);  
}

function pauseFunction(valor) {  
  if (!(minutes == 0 && seconds == 0)){
    clearInterval(myVar);
    if (seconds >= 60){
      minutes += Math.floor(seconds/60);
      seconds = Math.round((seconds/60 - Math.floor(seconds/60))*60);    
    }

    if (minutes < 10){
      document.getElementById("min").innerHTML = "0" + minutes + ": ";
    }else{
      document.getElementById("min").innerHTML = minutes + ": ";
    }

    if (seconds < 10){
      document.getElementById("seg").innerHTML = " 0" + seconds;
    }else{
      document.getElementById("seg").innerHTML = seconds;
    }

    switch (valor){
      case 0:
        // Pausar: remove o piscar
        console.log("Pause");
        document.getElementById("continue").style.display = "inline-block";
        document.getElementById("pause").style.display = "none";
        pausado = 1;
        document.body.classList.remove("alerta");
        break;
      case 1:
        // Continuar (o clique do usuário aqui também conta como interação)
        console.log("Continue");
        document.getElementById("continue").style.display = "none";
        document.getElementById("pause").style.display = "inline-block";
        pausado = 0;
        setSecondsFunction(0); // reinicia intervalo (e chama ensureAudio())
        break;  
    }
  }  
}