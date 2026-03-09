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

  useEffect(() => {
    async function setupDevice() {
      try {
        const response = await fetch("/token");
        const data = await response.json();
        const newDevice = new Device(data.token);
        newDevice.on("error", (err) => setError(err.message));
        setDevice(newDevice);
      } catch (err) {
        setError("Failed to connect to server.");
      }
    }
    setupDevice();
  }, []);

  const makeCall = async () => {
    if (!device) return;
    setError(null);
    setStatus("connecting");
    setDtmfInput("");
    try {
      const newCall = await device.connect({ params: { To: "+18302228555" } });
      newCall.on("accept", () => setStatus("connected"));
      newCall.on("disconnect", () => {
        setStatus("idle");
        setCall(null);
        setDtmfInput("");
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-xs p-6 flex flex-col items-center gap-5">
        {/* Header */}
        <h1 className="text-xl font-semibold text-gray-800">IVR Web Caller</h1>

        {/* Status badge */}
        <span
          className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full ${
            isConnected
              ? "bg-green-100 text-green-700"
              : isConnecting
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-500"
          }`}
        >
          {status}
        </span>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-500 text-center bg-red-50 rounded-lg px-3 py-2 w-full">
            {error}
          </p>
        )}

        {/* DTMF display */}
        <div className="w-full bg-gray-100 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest text-gray-700 min-h-[3rem]">
          {dtmfInput || <span className="text-gray-300 text-base">— dial pad —</span>}
        </div>

        {/* DTMF Keypad */}
        <div className={`grid grid-cols-3 gap-3 w-full transition-opacity duration-200 ${isConnected ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
          {DTMF_KEYS.flat().map((key) => (
            <button
              key={key}
              onClick={() => sendDtmf(key)}
              className="h-14 rounded-xl bg-gray-100 hover:bg-indigo-100 active:bg-indigo-200 text-gray-800 font-semibold text-lg transition-colors duration-150 select-none"
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
            className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold text-base transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Call IVR
          </button>
        ) : (
          <button
            onClick={hangUp}
            disabled={isConnecting}
            className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-semibold text-base transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isConnecting ? "Connecting…" : "Hang Up"}
          </button>
        )}
      </div>
    </div>
  );
};

export default WebCaller;
