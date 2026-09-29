export default function GroupOverview({
    name,
    time,
    age,
}: {
    name: string;
    time: string;
    age: string;
}) {
    const data = [
        { property: 'Gruppenstunde', value: time },
        { property: 'Alter', value: age },
    ];

    const listItems = data.map((d) => (
        <div className="flex items-start flex-col  mb-2" key={d.property}>
            <div className="w-44 font-bold text-xl">{d.property}:</div>
            <div className="place-self-start">{d.value}</div>
        </div>
    ));

    return (
        <>
            <h2 style={{ marginBottom: 10 }}>{name}</h2>
            <div className="flex ml-4">
                <div className="flex flex-col">{listItems}</div>
            </div>
        </>
    );
}
