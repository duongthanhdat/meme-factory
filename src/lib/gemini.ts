import { GoogleGenAI } from "@google/genai";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your-gemini-api-key") {
    throw new Error("GEMINI_API_KEY is not configured in .env.local");
  }
  return new GoogleGenAI({ apiKey });
}

export interface MemeContentResult {
  headline: string;
  subtext?: string;
  caption?: string;
  tone: string;
  text_position: "top" | "bottom" | "center" | "split";
  visual_direction?: {
    scene: string;
    character_styling: string;
    composition: string;
    camera: string;
    lighting: string;
    art_style: string;
  };
  suggested_characters: {
    character_id: string;
    character_name: string;
    suggested_emotion: string;
    reasoning: string;
    position: "left" | "right" | "center";
  }[];
}

export async function generateMemeContent(params: {
  idea: string;
  projectStyle?: string;
  characters: {
    id: string;
    name: string;
    personality: string;
    description: string;
    available_emotions: string[];
  }[];
  adHocCharacters?: string[];
  numVariations?: number;
  referenceImages?: { base64: string; mimeType: string }[];
}): Promise<MemeContentResult[]> {
  const ai = getClient();
  const { idea, projectStyle, characters, adHocCharacters = [], numVariations = 3, referenceImages } = params;

  const characterList = characters
    .map(
      (c) =>
        `- "${c.name}" (ID: ${c.id}): ${c.description}. Tính cách: ${c.personality}. Biểu cảm có sẵn: ${c.available_emotions.join(", ")}`
    )
    .join("\n");

  const hasRefImages = referenceImages && referenceImages.length > 0;

  const prompt = `Bạn là admin fanpage meme Việt Nam lâu năm, chuyên viết content viral. Bạn hiểu rõ cách nói chuyện trên mạng xã hội VN — tự nhiên, đời thường, đọc lên phải thấy "đúng quá đi" chứ không phải "AI viết".

NHIỆM VỤ: Viết ${numVariations} phiên bản meme từ ý tưởng bên dưới. Mỗi phiên bản phải khác nhau về góc nhìn hoặc cách kể.

Ý TƯỞNG: "${idea}"
${hasRefImages ? `\nẢNH THAM KHẢO: User đính kèm ${referenceImages!.length} ảnh. Phân tích context, mood, style từ ảnh để content sát thực tế hơn.` : ""}

${projectStyle ? `PHONG CÁCH FANPAGE: ${projectStyle}` : ""}

NHÂN VẬT CÓ SẴN:
${characterList || "(Chưa có nhân vật sẵn)"}

NHÂN VẬT MENTION 1 LẦN:
${adHocCharacters.length > 0 ? adHocCharacters.map((n) => `- ${n}`).join("\n") : "(Không có)"}

=== GIỌNG VĂN — ĐÂY LÀ PHẦN QUAN TRỌNG NHẤT ===

Headline PHẢI viết giống cách người Việt thực sự nói/nghĩ, không phải giọng copywriter hay AI. Hãy tưởng tượng bạn đang nhắn tin cho bạn bè hoặc đang tự chửi thầm trong đầu.

VÍ DỤ HEADLINE HAY (tự nhiên, đúng giọng):
- "Lương chưa về mà Shopee đã gửi mã"
- "Khi sếp nói 'cuối tuần rảnh không'"
- "Thứ 2 lại đến rồi, ai cho nó đến vậy"
- "Cầm 10 triệu vào crypto, ra 3 triệu kinh nghiệm"
- "Debug từ sáng, bug từ hôm qua"
- "Khi bạn nói '5 phút nữa' lần thứ 4"
- "Ơ sao tự nhiên tháng này hết tiền sớm vậy"
- "Thị trường xanh nhưng mã mình vẫn đỏ như thường"

VÍ DỤ HEADLINE DỞ (gượng, giọng AI/robot — TRÁNH):
- "Hành trình tài chính đầy thử thách!" ← giọng PR
- "Khi công nghệ và đam mê gặp nhau" ← giọng sách self-help
- "Nỗi đau của nhà đầu tư thông minh" ← quá văn vẻ
- "Chiến binh thị trường chứng khoán" ← cringe, không ai nói vậy
- "Cùng nhau vượt qua khó khăn nào!" ← giọng MC event
- "Đây chính là khoảnh khắc đáng nhớ" ← generic, vô hồn

NGUYÊN TẮC VIẾT:
- Viết như ĐANG KỂ CHUYỆN hoặc THAN THỞ, không phải đang quảng cáo
- Dùng từ ngữ đời thường: "ơ", "ủa", "vậy", "quá trời", "éo", "chán vl"... (tuỳ tone)
- Headline nên là 1 câu/tình huống cụ thể, không phải slogan chung chung
- Caption viết như đang nói chuyện với follower, có thể hỏi ngược "Ai giống tao không?"
- Nếu chủ đề là chứng khoán/crypto: dùng đúng tiếng lóng — "cháy tài khoản", "bắt đáy", "hold", "lên đỉnh", "about nền", "xanh lá", "đỏ lửa"
- Nếu chủ đề đời sống: dùng tình huống cụ thể ai cũng gặp, tránh triết lý chung chung
- ĐƯỢC phép dùng headline dài hơn nếu cần (tối đa 80 ký tự) — đừng cắt cụt câu chỉ vì ngắn
- Subtext CHỈ dùng khi thực sự cần punchline thêm, không bắt buộc
- Caption ngắn gọn, 1-2 câu, giọng nói chuyện — hoặc để trống nếu headline đã đủ

=== QUY TẮC CHỌN NHÂN VẬT ===
- Ưu tiên nhân vật có sẵn nếu phù hợp. Giải thích ngắn gọn lý do.
- Nhân vật mention 1 lần được phép dùng dù không có trong thư viện
- Nếu không nhân vật nào hợp thì để suggested_characters rỗng []
- Gợi ý biểu cảm từ danh sách có sẵn (nếu dùng nhân vật thư viện)

=== VISUAL DIRECTION ===
Tạo visual_direction chi tiết cho AI image gen:
- scene: bối cảnh cụ thể (phòng ngủ lúc 2h sáng, văn phòng, quán cafe...)
- character_styling: thần thái, outfit theo ngữ cảnh (mệt mỏi, hớn hở, hoảng loạn...)
- composition: vị trí nhân vật, tương quan foreground/background
- camera: góc máy, cỡ cảnh
- lighting: ánh sáng
- art_style: phong cách minh hoạ

Trả về JSON array, mỗi phần tử:
{
  "headline": "...",
  "subtext": "..." hoặc null,
  "caption": "..." hoặc null,
  "tone": "hài hước/châm biếm/tự sự/absurd/wholesome/dark humor/...",
  "text_position": "top|bottom|center|split",
  "visual_direction": {
    "scene": "...",
    "character_styling": "...",
    "composition": "...",
    "camera": "...",
    "lighting": "...",
    "art_style": "..."
  },
  "suggested_characters": [
    {
      "character_id": "...",
      "character_name": "...",
      "suggested_emotion": "...",
      "reasoning": "...",
      "position": "left|right|center"
    }
  ]
}

CHỈ trả về JSON array, không có text khác.`;

  // Build multimodal contents: text + reference images
  const contents: (
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }
  )[] = [{ text: prompt }];

  if (hasRefImages) {
    for (const img of referenceImages!.slice(0, 4)) {
      contents.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.base64,
        },
      });
    }
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: contents,
    config: {
      responseMimeType: "application/json",
      temperature: 0.9,
    },
  });

  const text = response.text ?? "[]";
  
  try {
    const results = JSON.parse(text) as MemeContentResult[];
    return results;
  } catch {
    console.error("Failed to parse Gemini response:", text);
    return [];
  }
}
