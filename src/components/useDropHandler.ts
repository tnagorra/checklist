import { useState, useRef } from 'react';

interface DragHandler<T> {
    (e: React.DragEvent<T>): void;
}

function useDropHandler(
    dragStartHandler: DragHandler<HTMLDivElement>,
    dropHandler: DragHandler<HTMLDivElement>,
) {
    const [dropping, setDropping] = useState(false);
    const dragEnterCount = useRef(0);

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        if (dragEnterCount.current === 0) {
            setDropping(true);

            dragStartHandler(e);
        }
        dragEnterCount.current += 1;
    };
    const onDragLeave = () => {
        dragEnterCount.current -= 1;
        if (dragEnterCount.current === 0) {
            setDropping(false);
        }
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        dragEnterCount.current = 0;
        setDropping(false);

        dropHandler(e);

        e.preventDefault();
    };


    return {
        dropping,

        onDragOver,
        onDragEnter,
        onDragLeave,
        onDrop,
    };
}
export default useDropHandler;
