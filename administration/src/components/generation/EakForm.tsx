import React, {useState} from "react";
import {Button, Card, FormGroup, InputGroup, MenuItem} from "@blueprintjs/core";
import {ItemRenderer, Select} from "@blueprintjs/select";
import {CardType} from "../../models/CardType";
import {DateInput} from "@blueprintjs/datetime";
import "@blueprintjs/datetime/lib/css/blueprint-datetime.css";
import styled from "styled-components";

const CardHeader = styled.div`
  margin: -20px -20px 20px -20px;
  padding: 1px;
  border-bottom: 1px solid rgba(16, 22, 26, 0.15);
  display: flex;
  justify-content: right;
`;

const CardTypeSelect = Select.ofType<CardType>();

const renderCardType: ItemRenderer<CardType> = (cardType, {handleClick, modifiers, query}) => {
    if (!modifiers.matchesPredicate) {
        return null;
    }
    return (
        <MenuItem
            active={modifiers.active}
            disabled={modifiers.disabled}
            label={cardType}
            key={cardType}
            onClick={handleClick}
        />
    );
};

interface Props {
    onRemove: () => void
}

const EakForm = (props: Props) => {
    const values = Object.values(CardType);
    const [selected, setSelected] = useState(values[0]);
    const [expirationDate, setExpirationDate] = useState(new Date());

    return (
        <div>
            <Card>
                <CardHeader>
                    <Button minimal icon="cross" onClick={props.onRemove} />
                </CardHeader>
                <FormGroup label="Vorname">
                    <InputGroup placeholder="Vorname"/>
                </FormGroup>
                <FormGroup label="Nachname">
                    <InputGroup placeholder="Nachname"/>
                </FormGroup>
                <FormGroup label="Ablaufdatum">
                    <DateInput placeholder="Ablaufdatum" value={expirationDate}
                               parseDate={str => new Date(str)}
                               onChange={value => setExpirationDate(value)}
                               formatDate={date => date.toLocaleDateString()}
                               fill={true}
                    />
                </FormGroup>
                <FormGroup label="Typ der Karte">
                    <CardTypeSelect
                        items={values}
                        onItemSelect={(value) => {
                            setSelected(value)
                        }}
                        itemRenderer={renderCardType}
                        filterable={false}
                    >
                        <Button text={selected} rightIcon="caret-down"/>
                    </CardTypeSelect>
                </FormGroup>
            </Card>
        </div>
    )
};

export default EakForm;