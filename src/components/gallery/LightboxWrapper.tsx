import Lightbox, { SlideImage } from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';

export default function LightboxWrapper({
    open,
    setOpen,
    slides,
    index,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    slides: SlideImage[];
    index: number;
}) {
    return (
        <Lightbox
            open={open}
            close={() => setOpen(false)}
            slides={slides}
            index={index}
            plugins={[Fullscreen, Captions, Zoom]}
        />
    );
}
