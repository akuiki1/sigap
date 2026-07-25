export default function AppLogo() {
    return (
        <>
            <img
                src="/images/cipta-karya/lambang-hst.png"
                alt="Lambang Kabupaten Hulu Sungai Tengah"
                className="size-8 flex-none object-contain"
            />
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Cipta Karya
                </span>
                <span className="truncate text-xs text-muted-foreground">
                    Dinas PUPR · Kab. HST
                </span>
            </div>
        </>
    );
}
