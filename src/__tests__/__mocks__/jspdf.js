// Mock for jspdf module
export const jsPDF = jest.fn().mockImplementation(() => ({
  setFontSize: jest.fn(),
  setTextColor: jest.fn(),
  text: jest.fn(),
  addImage: jest.fn(),
  save: jest.fn(),
  addPage: jest.fn(),
  setProperties: jest.fn(),
  autoTable: jest.fn(),
  output: jest.fn(() => new ArrayBuffer(0)),
}));
export default jsPDF;