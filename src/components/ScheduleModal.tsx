import React, { useState } from "react";
import { X, Calendar, Clock, Check, Send, Sparkles } from "lucide-react";

interface ScheduleModalProps {
  onClose: () => void;
}

export default function ScheduleModal({ onClose }: ScheduleModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [info, setInfo] = useState({ name: "", email: "", company: "", note: "" });

  const timeSlots = ["09:00 AM", "10:30 AM", "01:00 PM", "02:30 PM", "04:00 PM"];

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !info.name || !info.email) return;
    setStep("success");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#020617] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span>Book Discussion</span>
            </h3>
            <p className="text-xs text-slate-400">Schedule an interview or technical collaboration.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === "form" ? (
          <form onSubmit={handleBook} className="space-y-4 text-xs">
            {/* Pick Date */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Pick a Date</label>
              <input
                type="date"
                required
                value={selectedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Pick Time */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Select Available Time</label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`p-2 rounded-lg text-[10px] font-bold border transition-all ${
                      selectedTime === time
                        ? "bg-blue-600 border-blue-500 text-white shadow-lg"
                        : "bg-[#0e1423] border-white/5 text-slate-300 hover:border-white/20"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <input
                    type="text"
                    placeholder="Your Name"
                    required
                    value={info.name}
                    onChange={(e) => setInfo({ ...info, name: e.target.value })}
                    className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <input
                    type="email"
                    placeholder="Your Email"
                    required
                    value={info.email}
                    onChange={(e) => setInfo({ ...info, email: e.target.value })}
                    className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Company / Affiliation"
                  value={info.company}
                  onChange={(e) => setInfo({ ...info, company: e.target.value })}
                  className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <textarea
                  placeholder="Discussion Topic or Meeting Details..."
                  rows={2}
                  value={info.note}
                  onChange={(e) => setInfo({ ...info, note: e.target.value })}
                  className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedDate || !selectedTime}
              className="w-full py-3 bg-white hover:bg-blue-100 text-black font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              <span>Confirm Meeting Slot</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
              <Check className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Booking Request Dispatched</h4>
              <p className="text-xs text-slate-400">
                You have requested a call on <strong className="text-white">{selectedDate}</strong> at <strong className="text-white">{selectedTime}</strong>.
              </p>
            </div>
            <p className="text-xs text-slate-500 italic max-w-xs mx-auto">
              A calendar invite and meeting details have been sent to Ngoun Bunlux. Look forward to connecting!
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              Back to Portfolio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
