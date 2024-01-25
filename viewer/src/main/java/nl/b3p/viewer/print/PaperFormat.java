package nl.b3p.viewer.print;

public enum PaperFormat {
    A0_landscape(3140, 2198),
    A0_portrait(2100, 3192),
    A1_landscape(2110, 1501),
    A1_portrait(1400, 2198),
    A2_landscape(1436, 1020),
    A2_portrait(920, 1500),
    A3_landscape(940, 667),
    A3_portrait(600, 1008),
    A4_landscape(600, 418),
    A4_portrait(350, 660),
    A5_landscape(375, 240),
    A5_portrait(200, 420);

    private final double widthPx;
    private final double heightPx;

    PaperFormat(double widthPx, double heightPx) {
        this.widthPx = widthPx;
        this.heightPx = heightPx;
    }

    public double getWidth() {
        return widthPx;
    }

    public double getHeight() {
        return heightPx;
    }
}