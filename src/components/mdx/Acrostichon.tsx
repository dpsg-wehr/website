import { AcrostichonData } from '@/types';

export default function Acrostichon({ data = [] }: { data?: AcrostichonData[] }) {
    if (!data || !Array.isArray(data)) {
        return null;
    }
    const rows = data.map((item, i) => {
        return (
            <div key={i} className="flex justify-center align-middle items-center">
                <div key={item.left} className="flex-1 text-right my-0 text-xl">
                    {item.left == '' ? <br /> : item.left}
                </div>
                <div
                    key={item.middle}
                    className="flex-shrink-0 text-center mx-2 font-semibold text-blue-600 text-4xl my-0"
                >
                    {item.middle == '' ? <br /> : item.middle}
                </div>
                <div key={item.right} className="flex-1 my-0 text-xl">
                    {item.right == '' ? <br /> : item.right}
                </div>
            </div>
        );
    });

    return <div>{rows}</div>;
}
