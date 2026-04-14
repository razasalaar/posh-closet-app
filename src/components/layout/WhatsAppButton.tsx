

const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/923262500066"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50  text-primary-foreground rounded-full p-4  transition-transform hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <img src="/w.png" alt="WhatsApp" className="w-12 h-12 object-contain" />
    </a>
  );
};

export default WhatsAppButton;
