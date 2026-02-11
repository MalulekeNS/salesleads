import * as React from "react";
import { createContext, useContext, useState, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

type MessageType = "success" | "error" | "warning" | "info";

interface Message {
  title: string;
  description?: string;
  type: MessageType;
}

interface MessageDialogContextType {
  showMessage: (message: Message) => void;
}

const MessageDialogContext = createContext<MessageDialogContextType | undefined>(undefined);

export const useMessageDialog = () => {
  const context = useContext(MessageDialogContext);
  if (!context) {
    throw new Error("useMessageDialog must be used within a MessageDialogProvider");
  }
  return context;
};

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: "text-primary",
  error: "text-destructive",
  warning: "text-rating",
  info: "text-primary-light",
};

export const MessageDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const showMessage = useCallback((msg: Message) => {
    setMessage(msg);
    setOpen(true);
  }, []);

  const Icon = message ? iconMap[message.type] : null;

  return (
    <MessageDialogContext.Provider value={{ showMessage }}>
      {children}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent 
          className="max-w-md border-0 shadow-strong"
          style={{
            background: 'linear-gradient(135deg, rgba(1, 70, 24, 0.95) 0%, rgba(64, 170, 73, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <AlertDialogHeader className="text-center">
            {Icon && (
              <div className="flex justify-center mb-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                >
                  <Icon className={`w-8 h-8 ${colorMap[message?.type || 'info']} ${message?.type === 'success' ? 'text-white' : ''}`} />
                </div>
              </div>
            )}
            <AlertDialogTitle className="text-xl font-bold text-white text-center">
              {message?.title}
            </AlertDialogTitle>
            {message?.description && (
              <AlertDialogDescription className="text-white/80 text-center mt-2">
                {message.description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter className="justify-center mt-4">
            <AlertDialogAction 
              className="px-8 bg-white text-primary hover:bg-white/90 font-semibold"
              onClick={() => setOpen(false)}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MessageDialogContext.Provider>
  );
};
