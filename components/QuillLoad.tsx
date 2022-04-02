import { useEffect, createContext, useContext } from 'react'
import { useRef } from 'react'
import dynamic from 'next/dynamic'
import { Loader } from 'rsuite'

export const QuillLoadingContext = createContext<((value: boolean) => void) | undefined>(undefined);
const QuillLoader = () => {
    const setLoading = useContext(QuillLoadingContext);
    useEffect(() => {
        if (setLoading) {
            setLoading(true);
            return () => setLoading(false);
        }
    }, [setLoading]);

    return (
        <Loader content="Loading lyrics..." />
    )
}
export const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <QuillLoader />
});

export const quillModules = {
    toolbar: {
        container: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline','strike'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            ['link'],
            ['clean']
        ]
    },
};

export const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image'
];

export function useQuillToolbar() {
    const quillToolbar = useRef<Element|undefined>(undefined);
    quillToolbar.current = document.getElementsByClassName('ql-toolbar ql-snow')[0];
  
    return quillToolbar.current;
}