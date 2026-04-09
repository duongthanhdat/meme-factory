export const compressImageToBase64 = async (file: File | Blob, maxWidth = 1024): Promise<{ base64: string, mimeType: string }> => {
  // Fast path: If the file is already small (< 400KB), skip heavy canvas compression.
  // This completely eliminates UI lag (main thread blocking) on mobile devices
  // when generating memes using characters that are already optimized on Supabase.
  if (file.size < 400 * 1024) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve({ 
          base64: result.split(",")[1], 
          mimeType: file.type || "image/jpeg" 
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let width = img.width;
      let height = img.height;
      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#FFFFFF"; // in case of transparent PNGs
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        resolve({ base64: dataUrl.split(",")[1], mimeType: "image/jpeg" });
      } else {
        reject(new Error("Canvas context is null"));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image load error"));
    };
    img.src = url;
  });
};

export const compressImageToFile = async (file: File | Blob, maxWidth = 1024, fileName = "image.jpg"): Promise<File> => {
  const { base64, mimeType } = await compressImageToBase64(file, maxWidth);
  const res = await fetch(`data:${mimeType};base64,${base64}`);
  const blob = await res.blob();
  return new File([blob], fileName, { type: mimeType });
};