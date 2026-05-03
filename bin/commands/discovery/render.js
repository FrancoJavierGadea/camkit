import { getPackageJson } from "#bin/utils/getPackageJson.js";
import Table from "#bin/utils/text/Table.js";
import ANSI from "#bin/utils/text/ANSI.js";
import LOGO from "#bin/ui/logo.js";
import { Header } from "#bin/ui/header.js";
import Loader from "#bin/utils/text/Loader.js";
import LoadingScreen from "#bin/utils/text/LoadingScreen.js";

const packageJson = await getPackageJson();

export function renderFull(params = {}) {
    
    const { hostIp, timeout, multicast_ip, port} = params;

    const format = ANSI.createFormatter({enabled: true});

    const header = new Header({ 
        logo: LOGO, 
        table: new Table({
            data: [
                [
                    { text: 'Version', styles: ['dim'] },
                    { text: packageJson.version, styles: ['bold', 'green'], align: 'left' }
                ],
                [
                    { text: 'Mode', styles: ['dim'] },
                    { text: 'discovery', styles: ['bold', 'blue'], align: 'left' }
                ],
                [
                    { text: 'Multicast IP', styles: ['dim'] },
                    { text: multicast_ip, styles: ['cyan'], align: 'left' }
                ],
                [
                    { text: 'Port', styles: ['dim'] },
                    { text: port, styles: ['yellow'], align: 'left' }
                ],
                [
                    { text: 'Local Address', styles: ['dim'] },
                    { text: hostIp, styles: ['magenta'], align: 'left' }
                ],
                [
                    { text: 'Timeout', styles: ['dim'] },
                    { text: `${timeout} ms`, styles: ['red'] }
                ]
            ],
            separator: ':',
            gap: 1,
            format
        }), 
        format
    });

    const {lines:headerLines} = header.render();

    process.stderr.write( headerLines.join('\n') + '\n\n');


    const loader = new Loader({
        messages: {
            loading: {
                text: 'Scanning Network...',
                styles: ['dim']
            },
        },
        format,
        styles: ['yellow', 'bold']
    });

    let founded = 0;

    const resultsTable = new Table({
        data: [
            Table.Row(['IP', 'Address', 'Camera Name'], { styles: ['bold', 'underline'], align: 'center' }),
        ],
        format
    });

    const loadingScreen = new LoadingScreen({
        interval: 100,
        content: [
            loader,
            '',
            () => {
                if(founded > 0) return resultsTable.render();

                return `No devices found...`
            }
        ]
    });



    return {
        onProbeSent(camera) {

            loadingScreen.start();
        },
        onDeviceFound({ ip, address }) {
            
            founded++;

            resultsTable.push([
                { text: ip, styles: ['green', 'bold'] },
                { text: address, styles: ['cyan'] },
                { text: 'Unknown', styles: ['dim'] }
            ]);
        },
        onClose() {
            
            loadingScreen.stop();

            const lines = [
                ...loader.render({complete: true}).lines,
                '',
                ...resultsTable.render().lines
            ];

            process.stdout.write(lines.join('\n'));
        }
    };
}

export function renderMinimal(params = {}) {

    // const { hostIp, timeout, multicast_ip, port} = params;

    // console.log(`Camkit ONVIF Discovery - Version ${packageJson.version}`);
    // console.log(SPLIT);

    // return {
    //     onProbeSent() {
    //         console.log(`🚀 ONVIF probe sent to ${ANSI.apply(multicast_ip, 'cyan')} on port ${ANSI.apply(port, 'cyan')}`);
    //         console.log(`   With local address ${ANSI.apply(hostIp, 'yellow')}`);
    //         console.log(`   Waiting for response... (Timeout: ${ANSI.apply(timeout, 'yellow')} ms)`);
    //         console.log(SPLIT);
    //     },
    //     onDeviceFound({ ip, address }) {
    //         console.log(`\n📡 Device found: ${ANSI.apply(ip, 'green', 'bold')}`);
    //         console.log(`>> ${ANSI.apply(address, 'underline')}`);
    //     },
    //     onClose() {
    //         console.log('\n' + SPLIT);
    //         console.log('⏰ Discovery completed.');
    //     }
    // };
}