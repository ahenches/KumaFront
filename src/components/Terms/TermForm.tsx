import React, { useState, useEffect } from 'react';
import { addTerm, updateTerm } from '../../services/termService';
import { getCategories } from '../../services/categoryService';
import { getThemes } from '../../services/themeService';
import { getLanguages } from '../../services/languageService';
import { useNavigate } from 'react-router-dom';

interface TermFormProps {
    termId?: string;
    initialData?: {
        term: string;
        translation: string;
        definition: string;
        grammaticalCategory: string;
        theme: string;
        language: string;
    };
}

const TermForm: React.FC<TermFormProps> = ({ termId, initialData }) => {
    const [term, setTerm] = useState(initialData?.term || '');
    const [definition, setDefinition] = useState(initialData?.definition || '');
    const [translation, setTranslation] = useState(initialData?.translation || '');
    const [grammaticalCategory, setGrammaticalCategory] = useState(initialData?.grammaticalCategory || '');
    const [theme, setTheme] = useState(initialData?.theme || '');
    const [language, setLanguage] = useState(initialData?.language || '');
    const [newCategory, setNewCategory] = useState('');
    const [newTheme, setNewTheme] = useState('');
    const [newLanguage, setNewLanguage] = useState('');
    const [categories, setCategories] = useState<{ _id: string, name: string }[]>([]);
    const [themeOptions, setThemeOptions] = useState<{ _id: string, name: string }[]>([]);
    const [languageOptions, setLanguageOptions] = useState<{ _id: string, name: string, code: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rawValues, setRawValues] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const navigate = useNavigate();

    const updateRawValues = (updatedValues: Partial<typeof rawValues>) => {
        setRawValues((prevValues) => ({
            ...prevValues,
            ...updatedValues,
        }));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const categoriesData = await getCategories();
                const themesData = await getThemes();
                const languagesData = await getLanguages();
                setCategories([...categoriesData, { _id: 'other', name: 'Other' }]);
                setThemeOptions([...themesData, { _id: 'other', name: 'Other' }]);
                setLanguageOptions(Array.isArray(languagesData) ? [...languagesData, { _id: 'other', name: 'Other', code: '' }] : []);

                if (categoriesData.length > 0 && !initialData?.grammaticalCategory) {
                    setGrammaticalCategory(categoriesData[0].name);
                }
                if (themesData.length > 0 && !initialData?.theme) {
                    setTheme(themesData[0].name);
                }
                if (languagesData.length > 0 && !initialData?.language) {
                    setLanguage(languagesData[0].name);
                }
            } catch (error) {
                console.error('Error loading data', error);
                setError('Error loading data');
            }
        };

        fetchData();
    }, [initialData]);

    useEffect(() => {
        if (categories.length > 0 && !initialData?.grammaticalCategory) {
            setGrammaticalCategory(categories[0].name);
        }
        if (themeOptions.length > 0 && !initialData?.theme) {
            setTheme(themeOptions[0].name);
        }
        if (languageOptions.length > 0 && !initialData?.language) {
            setLanguage(languageOptions[0].name);
        }
    }, [categories, themeOptions, languageOptions, initialData]);

    const capitalizeWord = (word: string): string => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const termData = {
            term,
            translation,
            definition,
            grammaticalCategory: grammaticalCategory === 'Other' ? newCategory : grammaticalCategory,
            theme: theme === 'Other' ? newTheme : theme,
            language: language === 'Other' ? newLanguage : language,
        };

        try {
            if (termId) {
                await updateTerm(termId, termData);
            } else {
                await addTerm(termData);
            }
            setModalMessage("Your term has been submitted successfully. A moderator is going to review it soon.");
            setShowModal(true);
        } catch (error) {
            console.error('Error submitting term', error);
            setError('An error occurred while submitting the term.');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setGrammaticalCategory(value);
        if (value !== 'Other') {
            setNewCategory('');
        }
        updateRawValues({ grammaticalCategory: value });
    };

    const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setTheme(value);
        if (value !== 'Other') {
            setNewTheme('');
        }
        updateRawValues({ theme: value });
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setLanguage(value);
        if (value !== 'Other') {
            setNewLanguage('');
            const selectedLanguage = languageOptions.find(lang => lang.name === value);
            updateRawValues({ language: value, languageCode: selectedLanguage ? selectedLanguage.code : '' });
        } else {
            updateRawValues({ language: value, languageCode: '' });
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        navigate('/');
    };

    const Modal: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                    <h2 className="text-xl font-bold mb-4">Success</h2>
                    <p className="mb-4">{message}</p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg shadow-neumorphic transition-transform transform hover:scale-105 focus:outline-none"
                    >
                        OK
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-[5px_5px_10px_#d1d9e6,-5px_-5px_10px_#ffffff]">
                <h2 className="text-2xl font-bold mb-4">{termId ? 'Edit Term' : 'Add Term'}</h2>
                {error && <div className="mb-4 text-red-500">{error}</div>}
                <div className="mb-4">
                    <label className="block mb-2 text-gray-800" htmlFor="term">Term</label>
                    <input
                        type="text"
                        id="term"
                        value={term}
                        onChange={(e) => {
                            const value = capitalizeWord(e.target.value);
                            setTerm(value);
                            updateRawValues({ term: value });
                        }}
                        className="w-full p-3 rounded-lg shadow-inner bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-gray-800" htmlFor="translation">Translation</label>
                    <input
                        type="text"
                        id="translation"
                        value={translation}
                        onChange={(e) => {
                            const value = capitalizeWord(e.target.value);
                            setTranslation(value);
                            updateRawValues({ translation: value });
                        }}
                        className="w-full p-3 rounded-lg shadow-inner bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-gray-800" htmlFor="definition">Definition</label>
                    <textarea
                        id="definition"
                        value={definition}
                        onChange={(e) => {
                            setDefinition(e.target.value);
                            updateRawValues({ definition: e.target.value });
                        }}
                        className="w-full p-3 rounded-lg shadow-inner bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-gray-800" htmlFor="grammaticalCategory">Grammatical Category</label>
                    <select
                        id="grammaticalCategory"
                        value={grammaticalCategory}
                        onChange={handleCategoryChange}
                        className="w-full p-3 rounded-lg shadow-inner bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        required
                    >
                        {categories.map(category => (
                            <option key={category._id} value={category.name}>{category.name}</option>
                        ))}
                    </select>
                    {grammaticalCategory === 'Other' && (
                        <input
                            type="text"
                            placeholder="New Grammatical Category"
                            value={newCategory}
                            onChange={(e) => {
                                const value = capitalizeWord(e.target.value);
                                setNewCategory(value);
                                updateRawValues({ newCategory: value });
                            }}
                            className="w-full p-3 mt-2 rounded-lg shadow-inner bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        />
                    )}
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-gray-800" htmlFor="theme">Theme</label>
                    <select
                        id="theme"
                        value={theme}
                        onChange={handleThemeChange}
                        className="w-full p-3 rounded-lg shadow-inner bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        required
                    >
                        {themeOptions.map(theme => (
                            <option key={theme._id} value={theme.name}>{theme.name}</option>
                        ))}
                    </select>
                    {theme === 'Other' && (
                        <input
                            type="text"
                            placeholder="New Theme"
                            value={newTheme}
                            onChange={(e) => {
                                const value = capitalizeWord(e.target.value);
                                setNewTheme(value);
                                updateRawValues({ newTheme: value });
                            }}
                            className="w-full p-3 mt-2 rounded-lg shadow-inner bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        />
                    )}
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-gray-800" htmlFor="language">Language</label>
                    <select
                        id="language"
                        value={language}
                        onChange={handleLanguageChange}
                        className="w-full p-3 rounded-lg shadow-inner bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        required
                    >
                        {languageOptions.map(language => (
                            <option key={language._id} value={language.name}>{language.name}</option>
                        ))}
                    </select>
                    {language === 'Other' && (
                        <>
                            <input
                                type="text"
                                placeholder="New Language"
                                value={newLanguage}
                                onChange={(e) => {
                                    const value = capitalizeWord(e.target.value);
                                    setNewLanguage(value);
                                    updateRawValues({ newLanguage: value });
                                }}
                                className="w-full p-3 mt-2 rounded-lg shadow-inner bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            />
                        </>
                    )}
                </div>
                <button
                    type="submit"
                    className="w-full p-3 text-white rounded-lg bg-gray-400 shadow-[5px_5px_10px_#b3b3b3,-5px_-5px_10px_#ffffff] hover:bg-gray-500 focus:outline-none"
                    disabled={loading}
                >
                    {loading ? 'Loading...' : termId ? 'Edit' : 'Add'}
                </button>
            </form>
            {showModal && <Modal message={modalMessage} onClose={handleCloseModal} />}
        </div>
    );
};

export default TermForm;
