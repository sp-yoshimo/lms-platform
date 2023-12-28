"use client"

import axios from "axios"
import MuxPlayer from "@mux/mux-player-react"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { FileWarning, Loader2, Lock } from "lucide-react"

import { cn } from "@/lib/utils"
import { useConfettiStore } from "@/hooks/use-confetti-store"

interface VideoPlayerProps {
    chapterId: string
    title: string
    courseId: string
    nextChapterId?: string
    playbackId: string
    isLocked: boolean
    completedOnEnd: boolean
}

export const VideoPlayer = ({
    chapterId,
    title,
    courseId,
    nextChapterId,
    playbackId,
    isLocked,
    completedOnEnd
}: VideoPlayerProps) => {

    const [isReady, setIsReady] = useState(false)
    const [isError, setIsError] = useState(false);

    const router = useRouter();
    const confetti = useConfettiStore();

    const onEnd = async() => {
        try{

            if(completedOnEnd){
                await axios.put(`/api/courses/${courseId}/chapters/${chapterId}/progress`,{
                    isCompleted: true,
                })
            }

            if(!nextChapterId){
                confetti.onOpen();
            }

            toast.success("Progress updated")
            router.refresh();

            if(nextChapterId){
                router.push(`/courses/${courseId}/chapters/${chapterId}`)
            }

        }catch(error){
            toast.error("Something went wrong")
        }
    }

    return (
        <div className=" relative aspect-video">
            {!isReady && !isLocked && (
                <div className=" absolute inset-0 flex items-center justify-center bg-slate-800">
                    <Loader2 className=" h-8 w-8 animate-spin text-secondary" />
                </div>
            )}
            {isLocked && (
                <div className=" absolute inset-0 flex items-center justify-center bg-slate-800 flex-col gap-y-2 text-secondary">
                    <Lock className=" h-8 w-8" />
                    <p className="text-sm">
                        This chapter is locked
                    </p>
                </div>
            )}
            {!isLocked && (
                <>
                    {isError ? (
                        <div className=" absolute inset-0 flex items-center justify-center bg-slate-800 flex-col gap-y-2 text-secondary">
                            <FileWarning className=" h-8 w-8" />
                            <p className="text-sm">
                                Sorry, Failed to load video.
                            </p>
                        </div>
                    ) : (
                        <MuxPlayer
                            title={title}
                            className={cn(
                                !isReady && "hidden"
                            )}
                            onCanPlay={() => setIsReady(true)}
                            onEnded={onEnd}
                            autoPlay
                            playbackId={playbackId}
                            onError={() => {
                                setIsError(true)
                            }}
                        />
                    )}

                </>
            )}
        </div>
    )

}