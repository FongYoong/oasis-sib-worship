import { useState } from 'react'
import { Stack, AutoComplete, Slider, Form, InputGroup, Input, Checkbox } from 'rsuite'
import AnimateHeight from 'react-animate-height';
import { defaultPPTSettings, defaultGreenBackground, defaultOverlayBackground, webSafeFonts, PPTSettings } from '../lib/powerpoint'

const ExportPPTSettings = ({ show, settings, setSettings }: { show: boolean, settings: PPTSettings, setSettings: (newSettings: PPTSettings) => void }) => {

    const [sampleText, setSampleText] = useState<string>("I know breakthrough is coming\nBy faith I see a miracle");

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
                        pointerEvents:'none'
                    }}>
                        <div style={{
                            position: 'absolute',
                            width: '40vh',
                            height: `${settings['overlayHeight'] / 5.625 * 22.5}vh`,
                            backgroundColor: defaultOverlayBackground,
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
                                textTransform: 'uppercase',
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
                <Form.Group>
                    <InputGroup style={{width: '100%'}} >
                        <InputGroup.Addon>
                            Font Name:
                        </InputGroup.Addon>
                        <AutoComplete data={webSafeFonts as any} value={settings['fontFace']}
                            onChange={(value) => setSettings({
                                ...settings,
                                fontFace: value
                            })}
                        />
                    </InputGroup>
                </Form.Group>
                <Form.Group>
                    <Stack direction='row' spacing='1em'>
                        <InputGroup.Addon>
                            Font Size: {settings['fontSize']} pt
                        </InputGroup.Addon>
                        <Slider progress style={{width: '20vh'}} value={settings['fontSize']} min={1} max={70}
                            onChange={(value) => setSettings({
                                ...settings,
                                fontSize: value
                            })}
                        />
                    </Stack>
                </Form.Group>
                <Form.Group>
                    <Stack direction='row' spacing='1em'>
                        <InputGroup.Addon>
                            Shape Height: {(settings['overlayHeight'] / 5.625 * 100).toFixed(2)} %
                        </InputGroup.Addon>
                        <Slider progress style={{width: '20vh'}} value={settings['overlayHeight'] / 5.625 * 100} min={0} max={100}
                            onChange={(value) => setSettings({
                                ...settings,
                                overlayHeight: value / 100 * 5.625
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
                        <InputGroup.Addon style={{
                            lineHeight: '16pt'
                        }}>
                            Sample<br />Text:
                        </InputGroup.Addon>
                        <Input as="textarea" rows={2} value={sampleText} placeholder="Type something here..."
                            style={{resize: 'none'}}
                            onChange={(text) => setSampleText(text)}
                        />
                    </InputGroup>
                </Form.Group>
            </Form>
        </AnimateHeight>
    )
}

export default ExportPPTSettings;