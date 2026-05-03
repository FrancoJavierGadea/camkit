param(
    [int]$Timeout = 3000,
    [string]$MulticastAddress = "239.255.255.250",
    [int]$Port = 3702
);

$splitLine = "---------------------------------------------------------";


$soapRequest = @"
<?xml version="1.0" encoding="UTF-8"?>
<e:Envelope xmlns:e="http://www.w3.org/2003/05/soap-envelope"
            xmlns:w="http://schemas.xmlsoap.org/ws/2004/08/addressing"
            xmlns:d="http://schemas.xmlsoap.org/ws/2005/04/discovery"
            xmlns:dn="http://www.onvif.org/ver10/network/wsdl">
    <e:Header>
        <w:MessageID>uuid:$(New-Guid)</w:MessageID>
        <w:To>urn:schemas-xmlsoap-org:ws:2005:04:discovery</w:To>
        <w:Action>http://schemas.xmlsoap.org/ws/2005/04/discovery/Probe</w:Action>
    </e:Header>
    <e:Body>
        <d:Probe>
            <d:Types>dn:NetworkVideoTransmitter</d:Types>
        </d:Probe>
    </e:Body>
</e:Envelope>
"@;


$udpClient = New-Object System.Net.Sockets.UdpClient;
$udpClient.EnableBroadcast = $true;
$udpClient.MulticastLoopback = $false;

# Send Request
$bytes = [Text.Encoding]::UTF8.GetBytes($soapRequest);

$endpoint = New-Object System.Net.IPEndPoint(
    [System.Net.IPAddress]::Parse($MulticastAddress),
    $Port
);

$udpClient.Send($bytes, $bytes.Length, $endpoint) | Out-Null;

$udpClient.Client.ReceiveTimeout = $Timeout;

Write-Host "🚀 ONVIF probe sent to $MulticastAddress on port $Port";
Write-Host "   Waiting for response... (Timeout: $Timeout ms)";
Write-Host $splitLine;
Write-Host "";

while($true){
    try {
        # Create an endpoint to capture the sender's IP address
        $remoteEP = New-Object System.Net.IPEndPoint([System.Net.IPAddress]::Any, 0);
        
        # Wait for an incoming UDP response.
        # Execution blocks here until data arrives or the receive timeout is reached, then a SocketException is thrown.
        $responseBytes = $udpClient.Receive([ref]$remoteEP);

        # Decode the received bytes as UTF-8 text
        $response = [Text.Encoding]::UTF8.GetString($responseBytes);

        Write-Host "📡 Device found: $($remoteEP.Address)";

        # Parse the XML response
        $xml = New-Object System.Xml.XmlDocument
        $xml.LoadXml($response)

        $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable);
        $ns.AddNamespace("d", "http://schemas.xmlsoap.org/ws/2005/04/discovery");

        $xaddrNode = $xml.SelectSingleNode("//d:XAddrs", $ns);

        Write-Host ">> $($xaddrNode.InnerText)";
        Write-Host "";
    }
    catch {
        break;
    }
}

Write-Host $splitLine;
Write-Host "⏰ Discovery completed.";

$udpClient.Close();