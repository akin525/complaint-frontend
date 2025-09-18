import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
    const [dark, setDark] = useState(false);

    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [dark]);

    return (
        <button
            onClick={() => setDark(!dark)}
            className="w-14 h-8 flex items-center bg-gray-300 dark:bg-gray-700 rounded-full px-1 transition-all relative"
        >
            <div
                className={`w-6 h-6 bg-white dark:bg-black rounded-full shadow-md transform transition-transform ${
                    dark ? "translate-x-6" : "translate-x-0"
                }`}
            />
            <span className="absolute left-1 text-yellow-500">
        <Sun size={14} />
      </span>
            <span className="absolute right-1 text-gray-300">
        <Moon size={14} />
      </span>
        </button>
    );
}
