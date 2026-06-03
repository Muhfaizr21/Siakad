import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ThemeColors from './ThemeColors';
import ThemeTypography from './ThemeTypography';
import ThemeBranding from './ThemeBranding';
import ThemeComponents from './ThemeComponents';
import ThemeStatusColors from './ThemeStatusColors';

export default function ThemeCustomizer({ section }) {
  const [searchParams] = useSearchParams();
  const urlSection = searchParams.get('tab');

  // Determine which section to show
  const activeSection = section || urlSection || 'colors';

  // Section mapping
  const sections = {
    colors: <ThemeColors />,
    typography: <ThemeTypography />,
    branding: <ThemeBranding />,
    components: <ThemeComponents />,
    status: <ThemeStatusColors />,
  };

  // Fallback to colors if section not found
  return sections[activeSection] || sections.colors;
}