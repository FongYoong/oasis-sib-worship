import { useState, useRef, useEffect, createContext, useContext } from 'react'
import dynamic from 'next/dynamic'
import AnimateHeight from 'react-animate-height';
import { Loader, Stack, Input, Button } from 'rsuite'
import { useQuill } from 'react-quilljs';
import { QuillOptionsStatic } from 'quill';
import Delta from 'quill-delta'

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
    history: {
        userOnly: true
    },
};

export const quillFormats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link'
];

// Song Editor
export const quillSongModules = {
    toolbar: {
        container: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            ['chord'],
            ['clean']
        ],
    },
    history: {
        userOnly: true
    },
    clipboard: {
        matchers: [
            ['SPAN', function(node: HTMLElement, delta: any) {
                const chord = node.getAttribute('data-chord');
                const index = node.getAttribute('data-range-index');
                const length = node.getAttribute('data-range-length');
                if(chord && index && length) {
                    const newDelta = delta.compose(new Delta().retain(delta.length(), {
                        chord: { chord, index, length }
                    }));
                    //newDelta = newDelta.compose(new Delta().retain(delta.length()).delete(1))
                    //console.log(delta.length())
                    return newDelta;
                }
            }],
            // [3, function(node: HTMLElement, delta: any) {
            //     //console.log(delta.length())
            //     //console.log("TEXTT")
            //     //console.log(delta)
            //     //console.log(node.data)
            //     //console.log(node.wholeText)
            //     return new Delta().insert(node.data);
            // }]
        ]
    }
};
export const quillSongFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'chord', 'chordHighlight', 's'
];

export function useQuillElements(quillInstance: any) {
    const [quillToolbar, setQuillToolbar] = useState<Element|undefined>(undefined);
    const [quillEditor, setQuillEditor] = useState<Element|undefined>(undefined);
    const [chordToolbarButton, setChordToolbarButton] = useState<Element|undefined>(undefined);

    const update = () => {
        if(quillInstance.current) {
            const toolbar = quillInstance.current.getModule('toolbar').container as HTMLElement;
            setQuillToolbar(toolbar)
            setQuillEditor(quillInstance.current.container.getElementsByClassName('ql-editor')[0]);
            setChordToolbarButton(toolbar.getElementsByClassName('ql-chord')[0]);
        }
    }

    useEffect(() => {
        update();
    }, [quillInstance.current])
  
    return {update, quillToolbar, quillEditor, chordToolbarButton};
}

export const generateChordId = (chord: string, index: number, length: number) => `chord-id-${chord}-${index}-${length}`;

export const addChordFormat = (Quill: any) => {
    // Create blot/format class
    const Inline = Quill.import('blots/inline');
    class ChordBlot extends Inline {
        static create(value: any) {
            if (!value) return super.create(false);
            const node = super.create(value);
            node.setAttribute('data-chord', value.chord);
            node.setAttribute('data-range-index', value.index);
            node.setAttribute('data-range-length', value.length);
            node.classList.add('quill-chord');
            node.classList.add(generateChordId(value.chord, value.index, value.length));
            return node;
        }
        static formats(domNode: any) {
            const chord = domNode.getAttribute('data-chord');
            const index = domNode.getAttribute('data-range-index');
            const length = domNode.getAttribute('data-range-length');

            if (chord) {
                return {
                    chord, index, length
                };
            }
            else {
                return super.formats(domNode);
            }
        }
        formats() {
            // Returns the formats list this class (this format).
            const formats = super.formats();
            formats['chord'] = ChordBlot.formats(this.domNode);
            return formats;
        }
    }
    ChordBlot.blotName = 'chord';
    ChordBlot.tagName = 'span';
    Quill.register('formats/chord', ChordBlot);

    // Create highlighted blot/format class
    class ChordHighlightBlot extends Inline {
        static create(value: any) {
            if (!value) return super.create(false);
            const node = super.create(value);
            node.setAttribute('data-selected', value);
            node.classList.add('quill-chord-selected');
            return node;
        }
        static formats(domNode: any) {
            const selectedData = domNode.getAttribute('data-selected');
            if (selectedData) {
                return selectedData;
            }
            else {
                return super.formats(domNode);
            }
        }
        formats() {
            // Returns the formats list this class (this format).
            const formats = super.formats();
            formats['chordHighlight'] = ChordHighlightBlot.formats(this.domNode);
            return formats;
        }
    }
    ChordHighlightBlot.blotName = 'chordHighlight';
    ChordHighlightBlot.tagName = 'span';
    Quill.register('formats/chordHighlight', ChordHighlightBlot);

    // For toolbar icon
    const icons = Quill.import('ui/icons');
    icons['chord'] = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-music-note" viewBox="0 0 16 16"><path d="M9 13c0 1.105-1.12 2-2.5 2S4 14.105 4 13s1.12-2 2.5-2 2.5.895 2.5 2z"/><path fill-rule="evenodd" d="M9 3v10H8V3h1z"/><path d="M8 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 13 2.22V4L8 5V2.82z"/></svg>`;
}

export const fixChordFormat = (quill: any) => {
    setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const allChordSpans = Array.from((quill.container as HTMLElement).getElementsByClassName('quill-chord'));
        const encountered: string[] = [];
        allChordSpans.forEach((el) => {
            if (encountered.includes(el.className)) {
                el.outerHTML = el.innerHTML;
            }
            else {
                encountered.push(el.className);
            }
        })
    }, 0);
}

export interface ReactQuillProps {
    style?: React.CSSProperties
    initQuill?: (Quill: any) => void
    initQuillInstance?: (quill: any) => void
    onQuillChange?: (quill: any, Quill: any) => void
    initialReady?: boolean
    initialText?: string
    text?: string
    options?: QuillOptionsStatic
}

export const ReactQuill = ({style, initQuill, initQuillInstance, onQuillChange, initialReady, initialText, text, options}: ReactQuillProps) => {
    const { quill, quillRef, Quill } = useQuill(options);

    if (Quill && !quill) {
        if (initQuill) {
            initQuill(Quill);
        }
    }

    useEffect(() => {
        if (quill) {
            quill.root.setAttribute("spellcheck", "false"); // Disable spellcheck
            (quill.getModule('toolbar').container.childNodes as HTMLElement[]).forEach((qlFormatGroup) => {
                qlFormatGroup.childNodes.forEach((child) => {
                    if (child.nodeName == "BUTTON") {
                        const name = (child as HTMLElement).className.split('-')[1];
                        const title = name[0].toUpperCase() + name.substring(1);
                        (child as HTMLElement).setAttribute('title', title);
                    }
                })

            })
            if (initQuillInstance) {
                initQuillInstance(quill)
            }
        }
    }, [quill]);

    useEffect(() => {
        if (quill && initialReady) {
            if (initialText != undefined) {
                //quill.clipboard.dangerouslyPasteHTML(initialText);
                quill.root.innerHTML = initialText;
            }
        }
    }, [quill, initialReady]);

    useEffect(() => {
        if (quill && text) {
            if (onQuillChange) {
                onQuillChange(quill, Quill);
            }
            //quill.clipboard.dangerouslyPasteHTML(text);
            quill.root.innerHTML = text;
        }
    }, [quill, text]);


    return (
        <div ref={quillRef}
            style={style}
        />
    )

}

interface QuillSelectToolTipProps {
    show: boolean
    onConfirm: () => void
    style: React.CSSProperties
}

export const QuillSelectToolTip = ({show, onConfirm, style, ...props}: QuillSelectToolTipProps) => {

    return (
        <AnimateHeight
            animateOpacity
            duration={300}
            height={show ? "auto" : 0}
            style={{
                position: 'absolute',
                //transition: 'top 0.5s ease 0s, left 0.5s ease 0s',
                //zIndex: 0,
                ...style
            }}
            {...props}
        >
            <Button size='xs' onClick={() => {
                    onConfirm();
                }} color='violet' appearance="primary">
                ♫ Chord
            </Button>
            <div className="triangle-up" style={{
                position: 'absolute',
                top: -6,
                left: -2
            }}></div>
        </AnimateHeight>
    )
}

interface QuillChordToolTipProps {
    show: boolean
    onConfirm: (value: string) => void
    onClose: () => void
    style: React.CSSProperties
}

// eslint-disable-next-line react/display-name
export const QuillChordToolTip = ({show, onConfirm, onClose, style, ...props}: QuillChordToolTipProps) => {
    
    const containerRef = useRef<HTMLInputElement>(null);
    const chordInputRef = useRef<HTMLInputElement>(null);
    const confirmButtonRef = useRef<HTMLButtonElement>(null);

    const checkFocus = () => {
        if(show) {
            setTimeout(() => {
                if (![containerRef.current, chordInputRef.current, confirmButtonRef.current].includes(document.activeElement as HTMLInputElement)) {
                    onClose();
                }
            }, 50);
        }
    }

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.setAttribute("tabindex", "0");
            containerRef.current.onblur = () => {
                // setContainerFocused(false);
                checkFocus();
            };
            containerRef.current.onfocus = () => {
                // setContainerFocused(true);
                checkFocus();
            };
        }
        if (chordInputRef.current) {
            chordInputRef.current.setAttribute('autocomplete', 'off');
        }
    }, [])

    useEffect(() => {
        if(show) {
            chordInputRef.current?.focus();
        }
    }, [show])

    const submitChord = () => {
        if (chordInputRef.current && chordInputRef.current.value) {
            onConfirm(chordInputRef.current.value);
            chordInputRef.current.value = "";
            onClose();
        }
    }

    return (
        <AnimateHeight
            animateOpacity
            duration={300}
            height={show ? "auto" : 0}
            style={{
                position: 'absolute',
                transition: 'top 0.5s ease 0s, left 0.5s ease 0s',
                //zIndex: 0,
                ...style
            }}
            {...props}
        >
            <Stack
                ref={containerRef}
                spacing='1em' direction='column' justifyContent='center'
                style={{
                    background: "#e8ffed",
                    border: '3px solid #04594a',
                    borderRadius: '0.5em',
                    padding: "0.5em"
                }}
            >
                <Input
                    ref={chordInputRef}
                    name="chord"
                    size="xs"
                    placeholder="A, Em, C#..."
                    onBlur={() => {
                        checkFocus();
                    }}
                    onFocus={() => {
                        checkFocus();
                    }}
                    onKeyDown={(event) => {
                        if (event.key == "Enter") {
                            submitChord();
                        }
                    }}
                    onChange={(value: string, event) => {
                        event.target.value = value.toUpperCase();
                    }}
                />
                <Stack spacing='1em' direction='row' justifyContent='center' >
                    <Button ref={confirmButtonRef} size='xs' onClick={() => {
                            submitChord();
                        }} color="cyan" appearance="primary">
                        Add
                    </Button>
                    <Button size='xs' onClick={() => {
                            onClose();
                        }} color='red' appearance="primary">
                        Cancel
                    </Button>
                </Stack>
            </Stack>

        </AnimateHeight>
    )
}

    // Create style class
    // const Parchment = Quill.import('parchment');
    // const dataChord = new Parchment.Attributor.Attribute("data-chord", "data-chord", {
    //     scope: Parchment.Scope.INLINE,
    //     whitelist: null
    // });
    // Quill.register({ "attributors/attribute/data-chord": dataChord }, true);

    // const chordStyleClass = new Parchment.Attributor.Class("quill-chord", "quill-chord", {
    //     scope: Parchment.Scope.INLINE,
    //     whitelist: null
    //   });
    // Quill.register({ "attributors/class/quill-chord": chordStyleClass }, true);

    // const chordHighlightStyleClass = new Parchment.Attributor.Class("ql-chordHighlight", "ql-chordHighlight", {
    //     scope: Parchment.Scope.INLINE,
    //     whitelist: ["span"]
    //   });
    // Quill.register({ "attributors/class/ql-chordHighlight": chordHighlightStyleClass }, true);

    // const toolbar = Quill.import('toolbar');
    // toolbar.addHandler('chord', (value) => {
    //     console.log(123);
    //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //     // @ts-ignore
    //     const tooltip = new ChordTooltip(Quill);
    //     tooltip.show();
    //     //var range = quill.getSelection();
    //     // var valueExample = {
    //     //     name: 'Foo',
    //     //     uid: 10,
    //     //     cid: 20,
    //     //     group: 1
    //     // };
        
    //     //quill.formatText(range , 'track' , valueExample);
    // });

    // Create module/handler class
    // const QuillModule = Quill.import('core/module');
    // class ChordModule extends QuillModule {
    //     constructor() {
    //         console.log(9);
    //         //super(quill, options);

    //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //         // @ts-ignore
    //         this.tooltip = new ChordTooltip(this.quill, options.bounds);
    //         //this.quill.getModule('toolbar').addHandler('chord', this.chordHandler.bind(this));
    //     }

    //     chordHandler(value: any) {
    //         alert(5)
    //         if (value) {
    //             q;
    //             if (range == null || range.length === 0) {
    //                 return;
    //             }
    //             const preview = this.quill.getText(range);
    //             console.log(preview);
    //             this.tooltip.show();
    //         }
    //     }
    // }
    // Quill.register('modules/chord', () => {
    //     alert(1);
    // });

    //export const QuillLoadingContext = createContext<((value: boolean) => void) | undefined>(undefined);

// const QuillLoader = () => {
//     const setLoading = useContext(QuillLoadingContext);
//     useEffect(() => {
//         if (setLoading) {
//             setLoading(true);
//             return () => setLoading(false);
//         }
//     }, [setLoading]);

//     return (
//         <Loader content="Loading lyrics..." />
//     )
// }

// export const ReactQuill = dynamic(() => import('react-quill'), {
//     ssr: false,
//     loading: () => <QuillLoader />
// });