package lol.dest4590.agario2.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class Food {
    public Integer x;
    public Integer y;
    public Integer size;

    public Food(Integer x, Integer y, Integer size) {
        this.x = x;
        this.y = y;
        this.size = size;
    }

    public Food() {
    }

    public Integer getX() {
        return x;
    }

    public void setX(Integer x) {
        this.x = x;
    }

    public Integer getY() {
        return y;
    }

    public void setY(Integer y) {
        this.y = y;
    }

    public Integer getSize() {
        return size;
    }

    public void setSize(Integer size) {
        this.size = size;
    }
}

