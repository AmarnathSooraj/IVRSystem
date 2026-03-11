import { useEffect, useRef, useState } from "react";
import { Device } from "@twilio/voice-sdk";

const DTMF_KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["*", "0", "#"],
];

const WebCaller = () => {
  const [device, setDevice] = useState(null);
  const [call, setCall] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | connecting | connected | disconnected
  const [dtmfInput, setDtmfInput] = useState("");
  const [error, setError] = useState(null);
  const [currentSpeech, setCurrentSpeech] = useState("");

  useEffect(() => {
    async function setupDevice() {
      try {
        const response = await fetch("http://localhost:5000/api/token");
        const data = await response.json();
        const newDevice = new Device(data.token);
        newDevice.on("error", (err) => setError(err.message));
        setDevice(newDevice);
      } catch (err) {
        setError("Failed to connect to server.");
      }
    }
    setupDevice();

    const eventSource = new EventSource("http://localhost:5000/api/stream-logs");
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.text) {
          setCurrentSpeech(data.text);
        }
      } catch (e) {
        console.error("Error parsing SSE data", e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const makeCall = async () => {
    if (!device) return;
    setError(null);
    setStatus("connecting");
    setDtmfInput("");
    setCurrentSpeech("");
    try {
      const newCall = await device.connect({ params: { To: "+18302228555" } });
      newCall.on("accept", () => setStatus("connected"));
      newCall.on("disconnect", () => {
        setStatus("idle");
        setCall(null);
        setDtmfInput("");
        setCurrentSpeech("");
      });
      newCall.on("error", (err) => {
        setError(err.message);
        setStatus("idle");
        setCall(null);
      });
      setCall(newCall);
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  };

  const hangUp = () => {
    if (call) call.disconnect();
    setCurrentSpeech("");
  };

  const sendDtmf = (digit) => {
    if (call && status === "connected") {
      call.sendDigits(digit);
      setDtmfInput((prev) => prev + digit);
    }
  };

  const isConnected = status === "connected";
  const isConnecting = status === "connecting";
  const isIdle = status === "idle";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-mainBlack/10 w-full max-w-xs p-6 flex flex-col items-center gap-5 shadow-sm">
        {/* Header */}
        <h1 className="text-xl font-semibold text-mainBlack">IVR Web Caller</h1>

        {/* Status badge */}
        <span
          className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border ${
            isConnected
              ? "bg-green-100 text-green-700 border-green-200"
              : isConnecting
                ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                : "bg-gray-100 text-gray-500 border-gray-200"
          }`}
        >
          {status}
        </span>

        {/* Error */}
        {error && (
          <p className="text-xs text-mainBlack text-center bg-mainBlack/5 border border-mainBlack/10 rounded-lg px-3 py-2 w-full">
            {error}
          </p>
        )}

        {/* IVR Speech Display */}
        {isConnected && currentSpeech && (
          <div className="w-full bg-blue-50/50 border border-blue-100/50 rounded-xl px-4 py-3 shadow-sm flex flex-col items-center animate-in fade-in duration-300">
            <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
              IVR is Speaking
            </span>
            <p className="text-sm text-blue-900 text-center font-medium leading-relaxed italic">
              "{currentSpeech}"
            </p>
          </div>
        )}

        {/* DTMF display */}
        <div className="w-full bg-mainBlack/5 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest text-mainBlack min-h-[3rem] border border-mainBlack/5">
          {dtmfInput || <span className="text-mainBlack/20 text-base">— dial pad —</span>}
        </div>

        {/* DTMF Keypad */}
        <div className={`grid grid-cols-3 gap-3 w-full transition-opacity duration-200 ${isConnected ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
          {DTMF_KEYS.flat().map((key) => (
            <button
              key={key}
              onClick={() => sendDtmf(key)}
              className="h-14 rounded-xl bg-white border border-mainBlack/10 hover:bg-mainBlack hover:text-white transition-all duration-150 select-none font-semibold text-lg"
            >
              {key}
            </button>
          ))}
        </div>

        {/* Call / Hang Up */}
        {isIdle ? (
          <button
            onClick={makeCall}
            disabled={!device}
            className="w-full py-3 rounded-xl bg-green-500 text-white font-semibold text-base hover:bg-green-600 active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          >
            Call IVR
          </button>
        ) : (
          <button
            onClick={hangUp}
            disabled={isConnecting}
            className="w-full py-3 rounded-xl bg-red-500 text-white font-semibold text-base hover:bg-red-600 active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          >
            {isConnecting ? "Connecting…" : "Hang Up"}
          </button>
        )}
      </div>
    </div>
  );
};

export default WebCaller;
