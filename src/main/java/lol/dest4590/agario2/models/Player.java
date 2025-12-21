package lol.dest4590.agario2.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lol.dest4590.agario2.util.PosUtil;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    public Player(String id, Integer x, Integer y, Integer radius, String name, String color, Input input, Integer weightLoseTick) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.name = name;
        this.color = color;
        this.input = input;
        this.weightLoseTick = weightLoseTick;
    }

    public Player() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public Integer getRadius() {
        return radius;
    }

    public void setRadius(Integer radius) {
        this.radius = radius;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Input getInput() {
        return input;
    }

    public void setInput(Input input) {
        this.input = input;
    }

    public Integer getWeightLoseTick() {
        return weightLoseTick;
    }

    public void setWeightLoseTick(Integer weightLoseTick) {
        this.weightLoseTick = weightLoseTick;
    }
}
