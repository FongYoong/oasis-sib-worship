import { useState, useRef, useEffect } from 'react'
import { Stack, Slider, Form, InputGroup, Input, Checkbox } from 'rsuite'
import AnimateHeight from 'react-animate-height'
import FastLevenshtein from 'fast-levenshtein'
import { defaultPPTSettings, defaultGreenBackground, defaultFonts, PPTSettings } from '../lib/powerpoint'
import { rgbaAlphaToHex } from '../lib/utils'
import hoverStyles from '../styles/hover.module.css'

const ExportPPTSettings = ({ show, settings, setSettings }: { show: boolean, settings: PPTSettings, setSettings: (newSettings: PPTSettings) => void }) => {

    const [sampleText, setSampleText] = useState<string>("I know breakthrough is coming\nBy faith I see a miracle");
    const [fontFaceInputBlur, setFontFaceInputBlur] = useState<boolean>(true);
    const [fontListBlur, setFontListBlur] = useState<boolean>(true);
    const [showFontList, setShowFontList] = useState<boolean>(false);

    useEffect(() => {
        if (fontFaceInputBlur && fontListBlur) {
            setShowFontList(false);
        }

    }, [fontFaceInputBlur, fontListBlur])

    return (
        <AnimateHeight
            animateOpacity
            duration={300}
            height={show ? "auto" : 0}
        >
            <Form fluid >
                <Form.Group>
                    <div style={{
                        width: '40vh',
                        height: '22.5vh',
                        backgroundColor: defaultGreenBackground,
                        pointerEvents:'none',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            width: '40vh',
                            height: `${settings['overlayHeight'] / 5.625 * 22.5}vh`,
                            backgroundColor: settings['overlayColor'] + rgbaAlphaToHex(settings['overlayAlpha']),
                        }}>
                            <p style={{
                                fontFamily: `${settings['fontFace']}, ${defaultPPTSettings['fontFace']}`,
                                fontSize: `${settings['fontSize'] / 720 * 40}vh`,
                                fontWeight: settings['bold'] ? 'bold' : '',
                                textAlign: 'center',
                                lineHeight: `${settings['fontSize'] / 600 * 40}vh`,
                                //lineHeight: `${settings['overlayHeight'] / 5.625 * 22.5}vh`,
                                color: 'white',
                                whiteSpace: 'pre-wrap',
                                textTransform: settings['uppercase'] ? 'uppercase' : 'none',
                                letterSpacing: settings['fontCharacterSpacing'] / 600 * 250,
                                //width: '100%',
                                //height: '100%',
                                position: 'relative',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                padding: '2pt'
                            }}>
                                {sampleText}
                            </p>
                        </div>
                    </div>
                </Form.Group>
                <div
                    style={{
                        border: "2px solid #009dbd",
                        padding: '0.5em',
                        height: '50vh',
                        overflowX: 'auto',
                        overflowY: 'auto'
                    }}
                >
                    <Form.Group>
                        <InputGroup style={{width: '100%'}} >
                            <InputGroup.Addon style={{
                                lineHeight: '16pt'
                            }}>
                                Sample<br />Text:
                            </InputGroup.Addon>
                            <Input as="textarea" rows={3} value={sampleText} placeholder="Type something here..."
                                style={{resize: 'none'}}
                                onChange={(text) => setSampleText(text)}
                            />
                        </InputGroup>
                    </Form.Group>
                    <Form.Group>
                        <InputGroup style={{width: '100%'}} >
                            <InputGroup.Addon>
                                Font Name:
                            </InputGroup.Addon>
                            {/* <AutoComplete data={defaultFonts as any} value={settings['fontFace']}
                                onChange={(value) => setSettings({
                                    ...settings,
                                    fontFace: value
                                })}
                            /> */}
                            <div style={{
                                position: 'relative'
                            }}>
                                <Input list="defaultFonts" value={settings['fontFace']}
                                    style={{resize: 'none'}}
                                    onChange={(value) => setSettings({
                                        ...settings,
                                        fontFace: value
                                    })}
                                    onFocus={() => {
                                        setFontFaceInputBlur(false);
                                        setShowFontList(true);
                                    }}
                                    onBlur={() => {
                                        setFontFaceInputBlur(true);
                                    }}
                                />
                                <div style={{
                                        visibility: showFontList ? 'visible' : 'hidden',
                                        zIndex: 1,
                                        position: 'absolute',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        top: 34,
                                        bottom: 'auto',
                                        left: 0,
                                        width: '100%',
                                    }}
                                >
                                    {defaultFonts.slice().sort((a, b) => {
                                        const aDist = FastLevenshtein.get(a.toLowerCase(), settings['fontFace'].toLowerCase());
                                        const bDist = FastLevenshtein.get(b.toLowerCase(), settings['fontFace'].toLowerCase());
                                        return aDist - bDist;
                                    }).map((font) =>
                                        <div key={font} className={hoverStyles.hover_glow} tabIndex={0} style={{
                                            cursor: 'pointer',
                                            width: '100%',
                                            position: 'relative',
                                            padding: '0.5em',
                                            background: 'white',
                                            border: '2px solid #94ffc2',
                                        }}
                                            onFocus={() => {
                                                setSettings({
                                                    ...settings,
                                                    fontFace: font
                                                })
                                                setFontListBlur(true);
                                            }}
                                        >
                                            {font}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* <datalist id="defaultFonts">
                                {defaultFonts.map((font) => <option key="font" value={font} />)}
                            </datalist> */}
                        </InputGroup>
                    </Form.Group>
                    <Form.Group>
                        <Stack direction='row' spacing='1em'>
                            <InputGroup.Addon>
                                Font Size: {settings['fontSize']} pt
                            </InputGroup.Addon>
                            <Slider progress style={{width: '20vh'}} value={settings['fontSize']} min={1} max={100}
                                onChange={(value) => setSettings({
                                    ...settings,
                                    fontSize: value
                                })}
                            />
                        </Stack>
                    </Form.Group>
                    <Form.Group>
                        <Stack direction='row' spacing='1em'>
                            <InputGroup.Addon style={{
                                lineHeight: 1.2
                            }} >
                                Character <br/> Spacing
                                <div>
                                    &nbsp;: {("0" + Math.round(settings['fontCharacterSpacing'] / 15 * 100)).slice(-2)} %
                                </div>
                            </InputGroup.Addon>
                            <Slider progress style={{width: '20vh'}} value={Math.round(settings['fontCharacterSpacing'] / 15 * 100)} min={0} max={100}
                                onChange={(value) => setSettings({
                                    ...settings,
                                    fontCharacterSpacing: value / 100 * 15
                                })}
                            />
                        </Stack>
                    </Form.Group>
                    <Form.Group>
                        <Stack direction='row' spacing='1em'>
                            <InputGroup.Addon style={{
                                lineHeight: 1.2
                            }} >
                                Line <br /> Threshold
                                <div>
                                    &nbsp;: {settings['lineThreshold']}
                                </div>
                            </InputGroup.Addon>
                            <Slider progress style={{width: '20vh'}} value={settings['lineThreshold']} min={1} max={100}
                                onChange={(value) => setSettings({
                                    ...settings,
                                    lineThreshold: value
                                })}
                            />
                        </Stack>
                    </Form.Group>
                    <Form.Group>
                        <InputGroup style={{width: '100%'}} >
                            <InputGroup.Addon>
                                Bold
                            </InputGroup.Addon>
                            <Checkbox checked={settings['bold']}
                                onChange={(_, checked) => setSettings({
                                    ...settings,
                                    bold: checked
                                })}
                            />
                        </InputGroup>
                    </Form.Group>
                    <Form.Group>
                        <InputGroup style={{width: '100%'}} >
                            <InputGroup.Addon>
                                Uppercase
                            </InputGroup.Addon>
                            <Checkbox checked={settings['uppercase']}
                                onChange={(_, checked) => setSettings({
                                    ...settings,
                                    uppercase: checked
                                })}
                            />
                        </InputGroup>
                    </Form.Group>
                    <Form.Group>
                        <Stack direction='row' spacing='1em'>
                            <InputGroup.Addon style={{
                                lineHeight: 1.2
                            }} >
                                Shape <br /> Height
                                <div>
                                    &nbsp;: {("0" + Math.round(settings['overlayHeight'] / 5.625 * 100)).slice(-2)} %
                                </div>
                            </InputGroup.Addon>
                            <Slider progress style={{width: '20vh'}} value={Math.round(settings['overlayHeight'] / 5.625 * 100)} min={0} max={100}
                                onChange={(value) => setSettings({
                                    ...settings,
                                    overlayHeight: value / 100 * 5.625
                                })}
                            />
                        </Stack>
                    </Form.Group>
                    <Form.Group>
                        <Stack direction='row' spacing='1em'>
                            <InputGroup.Addon>
                                Shape Color:
                            </InputGroup.Addon>
                            <input type="color" value={settings['overlayColor']}
                                onChange={(event) => setSettings({
                                    ...settings,
                                    overlayColor: event.target.value
                                })}
                            />
                        </Stack>
                    </Form.Group>
                    <Form.Group>
                        <Stack direction='row' spacing='1em'>
                            <InputGroup.Addon style={{
                                lineHeight: 1.2
                            }} >
                                Shape <br /> Alpha
                                <div>
                                    &nbsp;: {settings['overlayAlpha'].toFixed(2)}
                                </div>
                            </InputGroup.Addon>
                            <Slider progress style={{width: '20vh'}} value={settings['overlayAlpha']} min={0} max={1} step={0.01}
                                onChange={(value) => setSettings({
                                    ...settings,
                                    overlayAlpha: value
                                })}
                            />
                        </Stack>
                    </Form.Group>
                </div>
            </Form>
        </AnimateHeight>
    )
}

export default ExportPPTSettings;