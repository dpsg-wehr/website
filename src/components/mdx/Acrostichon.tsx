import { AcrostichonData } from '@/types';

export default function Acrostichon({ data = [] }: { data?: AcrostichonData[] }) {
    if (!data || !Array.isArray(data)) {
        return null;
    }
    const rows = data.map((item, i) => {
        return (
            <div key={i} className="flex items-center justify-center align-middle">
                <div key={item.left} className="my-0 flex-1 text-right text-xl">
                    {item.left == '' ? <br /> : item.left}
                </div>
                <div
                    key={item.middle}
                    className="mx-2 my-0 flex-shrink-0 text-center text-4xl font-semibold text-blue-600"
                >
                    {item.middle == '' ? <br /> : item.middle}
                </div>
                <div key={item.right} className="my-0 flex-1 text-xl">
                    {item.right == '' ? <br /> : item.right}
                </div>
            </div>
        );
    });

    return <div>{rows}</div>;
}
