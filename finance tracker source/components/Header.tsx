import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FinancialPeriod, SavingsGoal, Debt } from '../types';
import Button from './common/Button';
import ReportView from './ReportView';

interface HeaderProps {
  periods: FinancialPeriod[];
  savingsGoals: SavingsGoal[];
  debts?: Debt[];
  onImportData: (data: { periods: FinancialPeriod[]; savingsGoals: SavingsGoal[]; debts?: Debt[] }) => void;
  activePeriod: FinancialPeriod | undefined;
  totalSavings: number;
}

const Header: React.FC<HeaderProps> = ({ periods, savingsGoals, debts = [], onImportData, activePeriod, totalSavings }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = () => {
    const dataToExport = {
      periods,
      savingsGoals,
      debts,
    };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zenith-finance-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm("Are you sure you want to import this file? This will overwrite all current data in the app.")) {
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const importedData = JSON.parse(text);
          onImportData(importedData);
        }
      } catch (error) {
        console.error("Failed to parse imported file:", error);
        alert("Error: Could not read or parse the selected file. Please ensure it's a valid JSON export from this application.");
      } finally {
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
      }
    };
    reader.onerror = () => {
        alert("Error reading file.");
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
    reader.readAsText(file);
  };

  const handleGenerateReport = () => {
    if (!activePeriod) {
      alert("No active financial period to generate a report for. Please select a period.");
      return;
    }
    setIsGenerating(true);

    const reportContainer = document.createElement('div');
    document.body.appendChild(reportContainer);

    const root = createRoot(reportContainer);
    root.render(
      <React.StrictMode>
        <ReportView period={activePeriod} totalSavings={totalSavings} />
      </React.StrictMode>
    );

    // Delay to allow component to render, especially charts
    setTimeout(() => {
      const elementToCapture = reportContainer.querySelector<HTMLElement>('.report-view');
      if (!elementToCapture) {
        console.error("Could not find the report element to capture.");
        cleanup();
        return;
      }

      html2canvas(elementToCapture, { scale: 2, useCORS: true, logging: false })
        .then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
          
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          
          const imgProps = pdf.getImageProperties(imgData);
          const imgWidth = pdfWidth;
          const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

          let heightLeft = imgHeight;
          let position = 0;

          // Add first page
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          
          // Add subsequent pages if content is taller than one page
          while (heightLeft > 0) {
            position = position - pageHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          pdf.save(`Financial-Report-${activePeriod.name.replace(/\s/g, '_')}.pdf`);
        })
        .catch(err => {
          console.error("Error generating PDF:", err);
          alert("Sorry, an error occurred while generating the report PDF.");
        })
        .finally(cleanup);
    }, 500);

    const cleanup = () => {
        root.unmount();
        document.body.removeChild(reportContainer);
        setIsGenerating(false);
    };
  };


  return (
    <header className="bg-white/5 backdrop-blur-sm shadow-md dark:shadow-slate-800/50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
              Zenith Finance Tracker
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleGenerateReport} variant="secondary" disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Report'}
            </Button>
            <Button onClick={handleImportClick} variant="secondary">Import</Button>
            <Button onClick={handleExport} variant="secondary">Export</Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept=".json,application/json"
              className="hidden"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;