import { TagGroup } from '@/types';
import SelectWrapper from './SelectWrapper';
import Collapsible from '@/components/mdx/Collapsible';

export default function GalleryHeader({
    tags,
    setTags,
}: {
    tags: TagGroup[];
    setTags: (tags: TagGroup[]) => void;
}) {
    const dropdowns = tags.map((group: TagGroup) => (
        <SelectWrapper key={group.name} options={group} tags={tags} setTags={setTags} />
    ));

    return (
        <Collapsible label="Filter">
            <div className="mb-4 flex flex-col md:flex-row place-content-between gap-4">
                {dropdowns}
            </div>
        </Collapsible>
    );
}
