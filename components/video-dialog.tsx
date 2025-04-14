"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface VideoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  videoUrl: string
  title: string
}

export function VideoDialog({ open, onOpenChange, videoUrl, title }: VideoDialogProps) {
  // YouTubeの埋め込みURLに変換
  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch")) {
      const videoId = new URL(url).searchParams.get("v")
      return `https://www.youtube.com/embed/${videoId}`
    } else if (url.includes("youtu.be")) {
      const videoId = url.split("/").pop()
      return `https://www.youtube.com/embed/${videoId}`
    } else if (url.includes("vimeo.com")) {
      const videoId = url.split("/").pop()
      return `https://player.vimeo.com/video/${videoId}`
    }
    return url
  }

  const embedUrl = getEmbedUrl(videoUrl)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}の動画</DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full mt-4">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allowFullScreen
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
