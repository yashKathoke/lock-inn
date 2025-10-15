import { useState, useRef } from "react";
import { Calendar } from "./Calender";

interface FloatingCalendarProps {
    now: Date;
    targetDate: Date;
    startDate: Date;
}

export default function FloatingCalendar({ now, targetDate, startDate }: FloatingCalendarProps) {
    const [position, setPosition] = useState({ x: window.innerWidth - 400, y: 80 }); // initial top-right
    const dragOffset = useRef({ x: 0, y: 0 });
    const dragging = useRef(false);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        dragging.current = true;
        const rect = e.currentTarget.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!dragging.current) return;
        setPosition({
            x: e.clientX - dragOffset.current.x,
            y: e.clientY - dragOffset.current.y,
        });
    };

    const handleMouseUp = () => {
        dragging.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    };

    return (
        <div
            onMouseDown={handleMouseDown}
            style={{
                top: position.y,
                left: position.x,
            }}
            className="absolute z-50 cursor-grab p-4 rounded-lg shadow-lg select-none"
        >
            <Calendar now={now} targetDate={targetDate} startDate={startDate} />
        </div>
    );
}
