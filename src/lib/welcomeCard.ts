export interface WelcomeCardPayload {
  petName: string;
  ownerName: string;
  cohortNumber: number;
  cohortPosition: number;
  referralCode: string;
  tier: "starter" | "founding";
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  color = "#D4D4D4",
): number {
  ctx.fillStyle = color;
  const lines = wrapText(ctx, text, maxWidth);
  lines.forEach((line, idx) => ctx.fillText(line, x, y + idx * lineHeight));
  return y + lines.length * lineHeight;
}

function createCardDataUrl(payload: WelcomeCardPayload): string {
  const width = 1080;
  const height = 1350;
  const padding = 80;
  const cardX = 48;
  const cardY = 48;
  const cardW = width - 96;
  const cardH = height - 96;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable.");

  // Background
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#060606");
  bg.addColorStop(1, "#111111");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Card shell
  ctx.fillStyle = "#171717";
  ctx.strokeStyle = "rgba(255, 102, 0, 0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 28);
  ctx.fill();
  ctx.stroke();

  // Header
  ctx.fillStyle = "#FF6600";
  ctx.font = "700 26px Arial";
  ctx.fillText("WELCOME CARD", cardX + padding, cardY + padding);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 72px Arial";
  ctx.fillText("Welcome to the", cardX + padding, cardY + padding + 95);
  ctx.fillText("Founding Pack!!", cardX + padding, cardY + padding + 175);

  // Body
  const cardBody =
    payload.tier === "founding"
      ? "You're officially a key member of the MyPerro journey. Your generous support not only guarantees you priority shipping from our first batch, but also unlocks exclusive benefits only for our Founding Members."
      : "You're officially part of the MyPerro journey. Your support not only guarantees you early shipping from our first batch, but also unlocks benefits.";

  const cardFooter =
    "Welcome to the heart of the community. Let's create the future of smart pet care, together.";

  let y = cardY + padding + 250;
  ctx.font = "400 34px Arial";
  y = drawWrappedText(ctx, cardBody, cardX + padding, y, cardW - padding * 2, 50);
  y += 24;
  y = drawWrappedText(
    ctx,
    cardFooter,
    cardX + padding,
    y,
    cardW - padding * 2,
    50,
  );

  y += 24;
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "600 32px Arial";
  ctx.fillText("-Team MyPerro \u{1F43E}", cardX + padding, y);

  y += 70;
  ctx.fillStyle = "#A3A3A3";
  ctx.font = "500 27px Arial";
  ctx.fillText(
    `${payload.ownerName} with ${payload.petName} | Cohort ${payload.cohortNumber} | Spot #${payload.cohortPosition}`,
    cardX + padding,
    y,
  );

  // Footer stripe
  const stripeY = cardY + cardH - 180;
  ctx.fillStyle = "rgba(255, 102, 0, 0.12)";
  ctx.fillRect(cardX + 2, stripeY, cardW - 4, 130);
  ctx.strokeStyle = "rgba(255, 102, 0, 0.35)";
  ctx.strokeRect(cardX + 2, stripeY, cardW - 4, 130);

  ctx.fillStyle = "#FF6600";
  ctx.font = "700 26px Arial";
  ctx.fillText("Referral Code", cardX + padding, stripeY + 48);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 52px Arial";
  ctx.fillText(payload.referralCode, cardX + padding, stripeY + 108);

  return canvas.toDataURL("image/png");
}

async function createCardBlob(payload: WelcomeCardPayload): Promise<Blob> {
  const dataUrl = createCardDataUrl(payload);
  const res = await fetch(dataUrl);
  return res.blob();
}

export async function downloadWelcomeCard(payload: WelcomeCardPayload) {
  const dataUrl = createCardDataUrl(payload);
  const a = document.createElement("a");
  const safePet = payload.petName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  a.href = dataUrl;
  a.download = `myperro-welcome-card-${safePet || "pet"}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function shareWelcomeCard(payload: WelcomeCardPayload) {
  if (!navigator.share) {
    throw new Error("Native image sharing is not supported on this device/browser.");
  }

  const safePet = payload.petName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const blob = await createCardBlob(payload);
  const file = new File([blob], `myperro-welcome-card-${safePet || "pet"}.png`, {
    type: "image/png",
  });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      title: "MyPerro Welcome Card",
      files: [file],
    });
    return;
  }

  throw new Error("This device/browser cannot share image files.");
}
