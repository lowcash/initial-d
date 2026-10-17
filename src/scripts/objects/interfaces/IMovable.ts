export default interface IMovable {
    speed: number;

    /** `dt` is the frame scale from Common.getFrameScale (1.0 at 60 fps). */
    move(dt?: number): void;
};