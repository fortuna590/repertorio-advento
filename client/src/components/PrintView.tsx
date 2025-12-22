import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { repertorio } from '@/data/repertorio';

export function PrintView() {
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

  useEffect(() => {
    // Gerar QR codes para todos os links
    const generateQRCodes = async () => {
      const codes: Record<string, string> = {};
      
      for (const momento of repertorio) {
        for (const musica of momento.musicas) {
          if (musica.youtube) {
            const key = `${momento.id}-${musica.numero}-youtube`;
            try {
              codes[key] = await QRCode.toDataURL(musica.youtube, { width: 80 });
            } catch (err) {
              console.error('Erro ao gerar QR code:', err);
            }
          }
          if (musica.cifra) {
            const key = `${momento.id}-${musica.numero}-cifra`;
            try {
              codes[key] = await QRCode.toDataURL(musica.cifra, { width: 80 });
            } catch (err) {
              console.error('Erro ao gerar QR code:', err);
            }
          }
        }
      }
      
      setQrCodes(codes);
    };

    generateQRCodes();
  }, []);

  return (
    <div className="print-view bg-white text-black p-8">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-view, .print-view * {
            visibility: visible;
          }
          .print-view {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">LouvaMais - Advento</h1>
        <p className="text-gray-600">LouvaMais - Church Solutions</p>
        <p className="text-sm text-gray-500">29 músicas organizadas por momentos da missa</p>
      </div>

      {repertorio.map((momento) => (
        <div key={momento.id} className="mb-8 break-inside-avoid">
          <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-300 pb-2">
            {momento.numero} {momento.titulo}
            {momento.observacao && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({momento.observacao})
              </span>
            )}
          </h2>

          <div className="space-y-4">
            {momento.musicas.map((musica) => (
              <div key={musica.numero} className="flex gap-4 border-l-4 border-purple-500 pl-4 py-2">
                <div className="flex-1">
                  <div className="font-bold text-lg">
                    {musica.numero}. {musica.titulo}
                  </div>
                  <div className="text-gray-600">{musica.artista}</div>
                  {musica.observacao && (
                    <div className="text-sm text-gray-500 italic mt-1">
                      {musica.observacao}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 items-center">
                  {musica.youtube && qrCodes[`${momento.id}-${musica.numero}-youtube`] && (
                    <div className="text-center">
                      <img 
                        src={qrCodes[`${momento.id}-${musica.numero}-youtube`]} 
                        alt="QR YouTube"
                        className="w-16 h-16"
                      />
                      <div className="text-xs text-gray-500">YouTube</div>
                    </div>
                  )}
                  {musica.cifra && qrCodes[`${momento.id}-${musica.numero}-cifra`] && (
                    <div className="text-center">
                      <img 
                        src={qrCodes[`${momento.id}-${musica.numero}-cifra`]} 
                        alt="QR Cifra"
                        className="w-16 h-16"
                      />
                      <div className="text-xs text-gray-500">Cifra</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="text-center text-sm text-gray-500 mt-12 pt-4 border-t">
        <p>© 2025 LouvaMais - Church Solutions</p>
        <p>Instagram: @louvamais.solutions | Email: louvamais590@gmail.com</p>
      </div>
    </div>
  );
}
