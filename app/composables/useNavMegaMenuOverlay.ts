/**
 * Shared state between `LandingHeaderNav` (UPopover) and `layouts/default` (page dimmer).
 */
export function useNavMegaMenuOverlay() {
  const isMegaMenuOpen = useState("nav-mega-menu-overlay", () => false);

  function setMegaMenuOpen(value: boolean): void {
    isMegaMenuOpen.value = value;
  }

  return { isMegaMenuOpen, setMegaMenuOpen };
}
