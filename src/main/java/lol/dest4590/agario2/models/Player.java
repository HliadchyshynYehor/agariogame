package lol.dest4590.agario2.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lol.dest4590.agario2.util.PosUtil;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Player {
    public String id;
    public Integer x;
    public Integer y;
    public Integer radius;
    public String name;
    public String color;

    @JsonIgnore
    public Input input;

    @JsonIgnore
    public Integer weightLoseTick;

    public String sizeUpdateMessage() {
        return "playerUpdate:" + id + ":" + radius;
    }

    public boolean isPlayerMoving() {
        return input != null && (input.getXAxis() != 0 || input.getYAxis() != 0);
    }

    public boolean isCollidingWith(Player other) {
        return PosUtil.isTouching(x, y, other.x, other.y, this.radius + other.radius);
    }
}
