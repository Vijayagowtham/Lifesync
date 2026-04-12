import { useState, useEffect, useRef } from "react";
import { 
  MessageCircle, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Bot, 
  User,
  Loader2,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Hospital, Message } from "../types";
import { GoogleGenAI } from "@google/genai";

interface ChatbotProps {
  hospitals: Hospital[];
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function Chatbot({ hospitals, isOpen: externalIsOpen, setIsOpen: externalSetIsOpen }: ChatbotProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  
  const setIsOpen = (val: boolean) => {
    if (externalSetIsOpen) {
      externalSetIsOpen(val);
    } else {
      setInternalIsOpen(val);
    }
  };
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your Life Sync assistant. How can I help you today? You can ask about nearby hospitals, bed availability, or ambulance services.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  // Stable genAI instance - never re-create on re-render
  const genAIRef = useRef(new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" }));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const speak = (text: string) => {
    if (!speechEnabled) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const hospitalContext = hospitals.map(h => 
        `${h.name}: ${h.address}, ${h.distance}km away. Status: ${h.availability.status}. Beds: ${h.availability.beds}, ICU: ${h.availability.icu}, Doctors: ${h.availability.doctors}. Contact: ${h.contact}`
      ).join("\n");

      const systemPrompt = `You are Life Sync AI, a professional healthcare assistant. 
      Use the following hospital data to answer user queries accurately:
      ${hospitalContext}
      
      Guidelines:
      - Be concise, professional, and empathetic.
      - If asked for the "nearest" hospital, check the distance.
      - If asked for ICU or beds, check the availability.
      - If you don't know the answer, say "I'm sorry, I don't have that information. Please contact emergency services if this is an emergency."
      - Always prioritize emergency advice if the user seems to be in a life-threatening situation.`;

      const model = "gemini-2.0-flash-lite";
      const response = await genAIRef.current.models.generateContent({
        model,
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] },
          ...messages.map(m => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }]
          })),
          { role: "user", parts: [{ text: input }] }
        ]
      });

      const botContent = response.text || "I'm sorry, I couldn't process that request.";
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: botContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      speak(botContent);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[1000] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden mb-4 
                       w-[calc(100vw-2rem)] sm:w-[400px] 
                       h-[calc(100vh-8rem)] sm:h-[600px] max-h-[85vh]"
          >
            {/* Header */}
            <div className="bg-primary p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold">Life Sync AI</h3>
                  <p className="text-[10px] text-white/70 uppercase tracking-widest font-bold">Always Active</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/10"
                  onClick={() => setSpeechEnabled(!speechEnabled)}
                >
                  {speechEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/10"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6" viewportRef={scrollRef}>
              <div className="space-y-6">
                {messages.map((message) => (
                  <div 
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <Avatar className="w-8 h-8 flex-shrink-0 border border-slate-100">
                        {message.role === 'assistant' ? (
                          <div className="bg-red-50 w-full h-full flex items-center justify-center">
                            <Bot className="w-4 h-4 text-primary" />
                          </div>
                        ) : (
                          <div className="bg-primary/10 w-full h-full flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <AvatarFallback>{message.role === 'assistant' ? 'AI' : 'U'}</AvatarFallback>
                      </Avatar>
                      <div className={`p-4 rounded-2xl text-sm ${
                        message.role === 'user' 
                          ? 'bg-primary text-white rounded-tr-none' 
                          : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'
                      }`}>
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex gap-3 max-w-[85%]">
                      <Avatar className="w-8 h-8 flex-shrink-0 border border-slate-100">
                        <div className="bg-red-50 w-full h-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                      </Avatar>
                      <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-6 border-t border-slate-100 bg-white">
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <Input 
                    placeholder={isListening ? "Listening..." : "Type your query..."}
                    className={`pr-10 rounded-xl border-slate-100 bg-slate-50 h-12 focus-visible:ring-primary/20 ${isListening ? 'animate-pulse border-primary' : ''}`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`absolute right-1 top-1/2 -translate-y-1/2 rounded-lg ${isListening ? 'text-primary' : 'text-slate-400'}`}
                    onClick={toggleListening}
                  >
                    {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </Button>
                </div>
                <Button 
                  className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                  onClick={handleSend}
                  disabled={isTyping || !input.trim()}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <div className="mt-3 flex items-center justify-center gap-2">
                <Sparkles className="w-3 h-3 text-primary" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Powered by Gemini AI</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-2xl transition-all duration-300 ${isOpen ? 'bg-slate-900 rotate-90' : 'bg-primary hover:scale-110'}`}
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
      </Button>
    </div>
  );
}
