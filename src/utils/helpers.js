// utils/helpers.js

// Function to format file size
export const formatFileSize = bytes => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Function to validate pdf file
export const isPdfFile = fileType => {
  return fileType === 'application/pdf';
};

// Function to truncate text with ellipsis
export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  return text.slice(0, maxLength) + '...';
};

// Function to generate random color for category badges
export const getCategoryColor = category => {
  const colors = [
    '#4287f5', // blue
    '#42f5a7', // green
    '#f54242', // red
    '#f5a742', // orange
    '#a742f5', // purple
    '#f542d4', // pink
  ];

  // Generate a consistent index based on category string
  let sum = 0;
  for (let i = 0; i < category.length; i++) {
    sum += category.charCodeAt(i);
  }

  return colors[sum % colors.length];
};
