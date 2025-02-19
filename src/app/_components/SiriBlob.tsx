"use client";
import { useEffect, useRef } from "react";

export default function SiriBlobCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simple Circle
  // useEffect(() => {
  //   const canvas = canvasRef.current;
  //   if (!canvas) return;
  //   const ctx = canvas.getContext("2d");
  //   if (!ctx) return;

  //   canvas.width = window.innerWidth;
  //   canvas.height = window.innerHeight;

  //   let audioContext: AudioContext;
  //   let analyser: AnalyserNode;
  //   let dataArray: Uint8Array;

  //   let volume = 0;

  //   const startAudio = async () => {
  //     try {
  //       // Captures system audio (but might need a virtual audio cable on some systems)
  //       const stream = await navigator.mediaDevices.getUserMedia({
  //         audio: { echoCancellation: false, noiseSuppression: false }
  //       });

  //       audioContext = new AudioContext();
  //       analyser = audioContext.createAnalyser();
  //       const source = audioContext.createMediaStreamSource(stream);

  //       analyser.fftSize = 256; // Higher resolution
  //       dataArray = new Uint8Array(analyser.frequencyBinCount);
  //       source.connect(analyser);

  //       const updateVolume = () => {
  //         analyser.getByteFrequencyData(dataArray);
  //         volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 100; // Normalize volume
  //         requestAnimationFrame(updateVolume);
  //       };

  //       updateVolume();
  //     } catch (error) {
  //       console.error("Audio access error:", error);
  //     }
  //   };

  //   const drawCircle = () => {
  //     if (!ctx) return;
  //     ctx.clearRect(0, 0, canvas.width, canvas.height);

  //     const centerX = canvas.width / 2;
  //     const centerY = canvas.height / 2;
  //     const baseRadius = 100;
  //     const dynamicRadius = baseRadius + volume * 100; // Scale radius with volume

  //     ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  //     ctx.lineWidth = 4;

  //     ctx.beginPath();
  //     ctx.arc(centerX, centerY, dynamicRadius, 0, Math.PI * 2);
  //     ctx.stroke();

  //     requestAnimationFrame(drawCircle);
  //   };

  //   startAudio();
  //   drawCircle();

  //   return () => {
  //     audioContext?.close();
  //   };
  // }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let audioContext: AudioContext;
    let analyser: AnalyserNode;
    let dataArray: Uint8Array;

    let volume = 0;
    let time = 0;

    const startAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false }
        });

        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);

        analyser.fftSize = 256;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        source.connect(analyser);

        const updateVolume = () => {
          analyser.getByteFrequencyData(dataArray);
          volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 150; // Sensitivity
          requestAnimationFrame(updateVolume);
        };

        updateVolume();
      } catch (error) {
        console.error("Audio access error:", error);
      }
    };

    const drawBlob = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = 100;
      const dynamicRadius = baseRadius + volume * 50; // Increase size based on audio

      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = 3;

      ctx.beginPath();
      const points = 64;
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const distortion = Math.sin(angle * 6 + time * 0.05) * volume * 60; // Blob effect increases with volume

        const radius = volume > 0.01 ? dynamicRadius + distortion : baseRadius; // Circle when silent
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();

      time += 1; // Smooth animation

      requestAnimationFrame(drawBlob);
    };

    startAudio();
    drawBlob();

    return () => {
      audioContext?.close();
    };
  }, []);



  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full bg-black" />;
}
