import React, { useState } from 'react';
import { setupBucket, testBucketAccess } from '../appwrite/setup';

const AppwriteSetup = ({ onSetupComplete }) => {
    const [isSettingUp, setIsSettingUp] = useState(false);
    const [setupStatus, setSetupStatus] = useState('');
    const [showManualInstructions, setShowManualInstructions] = useState(false);

    const initializeAppwrite = async () => {
        setIsSettingUp(true);
        setSetupStatus('Checking setup...');

        try {
            // Simulate setup process
            await new Promise(resolve => setTimeout(resolve, 1500));
            await testBucketAccess();
            await setupBucket();
            
            setSetupStatus('Setup completed!');
            
            setTimeout(() => {
                if (onSetupComplete) {
                    onSetupComplete();
                }
            }, 1000);
            
        } catch (err) {
            console.error('Setup check failed:', err);
            setSetupStatus('Setup check completed with warnings');
        } finally {
            setIsSettingUp(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Appwrite Setup Check</h2>
                
                <p className="text-gray-600 mb-4">
                    We need to verify your Appwrite storage configuration.
                </p>
                
                {setupStatus && (
                    <p className="text-blue-600 mb-4 text-sm">{setupStatus}</p>
                )}
                
                <button
                    onClick={initializeAppwrite}
                    disabled={isSettingUp}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center mb-3"
                >
                    {isSettingUp ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Checking...
                        </>
                    ) : 'Check Setup'}
                </button>

                <button
                    onClick={() => setShowManualInstructions(!showManualInstructions)}
                    className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                    {showManualInstructions ? 'Hide Instructions' : 'Show Manual Setup Instructions'}
                </button>

                {showManualInstructions && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h3 className="font-semibold text-yellow-800 mb-2">Manual Setup Instructions:</h3>
                        <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
                            <li>Go to <a href="https://cloud.appwrite.io/" target="_blank" rel="noopener noreferrer" className="underline">Appwrite Console</a></li>
                            <li>Select your project</li>
                            <li>Go to <strong>Storage</strong> → <strong>Create Bucket</strong></li>
                            <li>Use these settings:
                                <ul className="list-disc list-inside ml-4 mt-1">
                                    <li><strong>Bucket ID</strong>: 68c68de40027053fc338</li>
                                    <li><strong>Name</strong>: AI-Stylist-Uploads</li>
                                    <li><strong>Permissions</strong>: Enable all (read, create, update, delete for "any")</li>
                                    <li><strong>File Size</strong>: 20MB</li>
                                    <li><strong>Allowed Extensions</strong>: jpg, jpeg, png, gif, webp</li>
                                </ul>
                            </li>
                            <li>Click <strong>Create</strong></li>
                            <li>Come back and click "Check Setup" above</li>
                        </ol>
                    </div>
                )}

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">
                        <strong>Note:</strong> This only checks if the setup is complete. The actual bucket must be created manually in Appwrite Console.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AppwriteSetup;