
export default function Maintenance() {
    return (
        <div className="min-h-screen bg-[#050B1E] text-white flex flex-col items-center justify-center p-6">
            <div className="bg-[#0A1128] p-10 rounded-2xl shadow-xl max-w-md text-center">
                <h1 className="text-3xl font-bold mb-4">🚧 Under Maintenance</h1>
                <p className="text-gray-300 mb-6">
                    We’re currently performing scheduled maintenance.<br />
                    Please check back between the allowed ask times.
                </p>
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mx-auto mb-4" />
                <p className="text-sm text-gray-500">
                    Thank you for your patience.
                </p>
            </div>
        </div>
    );
}
