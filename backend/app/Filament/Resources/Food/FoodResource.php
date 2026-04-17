<?php

namespace App\Filament\Resources\Food;

use App\Filament\Resources\Food\Pages\CreateFood;
use App\Filament\Resources\Food\Pages\EditFood;
use App\Filament\Resources\Food\Pages\ListFood;
use App\Filament\Resources\Food\Schemas\FoodForm;
use App\Filament\Resources\Food\Tables\FoodTable;
use App\Models\Food;
use BackedEnum;
use Filament\Resources\Resource;
use UnitEnum;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class FoodResource extends Resource
{
    protected static ?string $model = Food::class;

    protected static string|UnitEnum|null $navigationGroup = 'Menu';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return FoodForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return FoodTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListFood::route('/'),
            'create' => CreateFood::route('/create'),
            'edit' => EditFood::route('/{record}/edit'),
        ];
    }
}
