// Telegram Bot Token provided by user
const BOT_TOKEN = "8551813825:AAFGCu_HnTcm4LZz30vskjp8Hb3B11o-mV8";

export const sendTelegramReport = async (reportText: string, chatId: string, reportId: string) => {
  if (!chatId) {
    console.error("Telegram Chat ID is missing.");
    return;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  
  // Removed Markdown symbols (*, _) from header/footer to avoid confusion in plain text mode
  const header = `🚨 گزارش سیستم ZLD #${reportId.slice(-4)}\n📅 ${new Date().toLocaleTimeString('fa-IR')}\n\n`;
  const footer = `\n\n🤖 ارسال خودکار توسط ZLD Agent`;
  
  // Telegram limit is 4096 chars. We reserve space for header/footer.
  const availableSpace = 4096 - header.length - footer.length;
  let body = reportText;
  
  // Truncate if too long to avoid API error
  if (body.length > availableSpace) {
      body = body.substring(0, availableSpace - 100) + "...\n[ادامه متن حذف شد]";
  }

  const fullMessage = header + body + footer;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: fullMessage,
        // Removed parse_mode: 'Markdown' to prevent "Bad Request: can't parse entities" errors.
        // AI output often contains special characters (like underscores in formulas) that break Telegram's parser.
        disable_web_page_preview: true
      })
    });

    const data = await response.json();
    
    if (!data.ok) {
      console.error("Telegram API Error Response:", JSON.stringify(data, null, 2));
      throw new Error(`خطای تلگرام: ${data.description}`);
    }
    
    console.log("Telegram message sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Network Error sending to Telegram:", error);
    throw error;
  }
};

// Helper to test connection manually
export const testTelegramConnection = async (chatId: string) => {
    return sendTelegramReport("✅ اتصال سیستم ZLD به ربات تلگرام برقرار شد.\nاین یک پیام آزمایشی است.", chatId, "TEST");
}