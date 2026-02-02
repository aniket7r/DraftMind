import { useCallback, useState, RefObject } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

interface UseExportShareOptions {
  targetRef: RefObject<HTMLElement | null>;
  filename: string;
  title: string;
  subtitle?: string;
  getShareText?: () => string;
}

export function useExportShare({
  targetRef,
  filename,
  title,
  subtitle,
  getShareText,
}: UseExportShareOptions) {
  const [isCapturing, setIsCapturing] = useState(false);

  const captureElement = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    const el = targetRef.current;
    if (!el) return null;

    return html2canvas(el, {
      backgroundColor: '#0d1117',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      scrollY: -window.scrollY,
      windowHeight: el.scrollHeight,
    });
  }, [targetRef]);

  const buildShareText = useCallback(() => {
    if (getShareText) return getShareText();
    const parts = [title];
    if (subtitle) parts.push(subtitle);
    parts.push('\nGenerated with DraftMind AI #LeagueOfLegends #LoLEsports #DraftMindAI');
    return parts.join(' - ');
  }, [title, subtitle, getShareText]);

  const downloadPDF = useCallback(async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    const toastId = toast.loading('Generating PDF...');
    try {
      const canvas = await captureElement();
      if (!canvas) throw new Error('Capture failed');

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const imgW = canvas.width;
      const imgH = canvas.height;
      const orientation = imgW > imgH ? 'landscape' : 'portrait';
      const pdf = new jsPDF({ orientation, unit: 'px', format: [imgW, imgH] });
      pdf.addImage(imgData, 'JPEG', 0, 0, imgW, imgH);
      pdf.save(`${filename}.pdf`);

      toast.success('PDF downloaded!', { id: toastId });
    } catch {
      toast.error('Failed to generate PDF', { id: toastId });
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, captureElement, filename]);

  const downloadPNG = useCallback(async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    const toastId = toast.loading('Generating image...');
    try {
      const canvas = await captureElement();
      if (!canvas) throw new Error('Capture failed');

      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast.success('Image downloaded!', { id: toastId });
    } catch {
      toast.error('Failed to generate image', { id: toastId });
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, captureElement, filename]);

  const shareToTwitter = useCallback(() => {
    const text = buildShareText();
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      '_blank',
      'width=550,height=420',
    );
  }, [buildShareText]);

  const shareToReddit = useCallback(() => {
    const text = buildShareText();
    window.open(
      `https://www.reddit.com/submit?title=${encodeURIComponent(text)}`,
      '_blank',
    );
  }, [buildShareText]);

  const copyShareText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildShareText());
      toast.success('Copied to clipboard! Paste it in Discord or anywhere.');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  }, [buildShareText]);

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  const nativeShare = useCallback(async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title, text: buildShareText() });
    } catch {
      // User cancelled — ignore
    }
  }, [title, buildShareText]);

  return {
    isCapturing,
    downloadPDF,
    downloadPNG,
    shareToTwitter,
    shareToReddit,
    copyShareText,
    nativeShare,
    canNativeShare,
  };
}
